// db
const db = require('../db');

const answerUtil = require('../utils/answer')

// 分析sql
const anlayzeSql = require('../utils/sql');

// 数字转为sql类型
const toSqlType = require('../utils/type');

async function createExperiment(teacher_id, experiment) {
    //    1.检查是否有重名的实验
    let temp_exp_id;
    try {
        let sql = "select * from `user`.`__experiment` where exp_name = ?";
        let result = await db.sqlQuery(sql, [experiment.name]);
        if (result.data.length > 0) {
            return {
                'status': "201",
                'data': "该实验名已存在"
            };
        }
        // 2  不存在该实验 写入实验表
        sql = "INSERT into `user`.`__experiment` VALUES (?,?,?,?,?,?,?,?,?)";
        let tableStr = '';
        // 处理table
        for (let i = 0; i < experiment.tables.length; i++) {
            tableStr += experiment.tables[i];
            tableStr += '    ';
        }

        let exp_result = await db.sqlQuery(sql, [null, experiment.name, experiment.aim, experiment.desc, 0, tableStr, new Date().toLocaleDateString(), experiment.reachTime, experiment.deadline]);
        //新增映射关系
        sql = "INSERT into `user`.`__teacher_has_experiment` VALUES (?,?)";
        await db.sqlQuery(sql, [teacher_id, exp_result.data.insertId]);
        //8存答案 问题
        for (let i = 0; i < experiment.group.length; i++) {
            // answers[i] = answerUtil.handleAnswer(experiment.group[i].answer);
            sql = "insert into `user`.`__test` values (?,?,?,?,?)";
            let test_result = await db.sqlQuery(sql, [null, 0, experiment.group[i].score, experiment.group[i].problem, experiment.group[i].answer]);
            sql = "insert into `user`.`__experiment_has_test` values (?,?)";
            await db.sqlQuery(sql, [exp_result.data.insertId, test_result.data.insertId]);
        }

        return {
            'status': 200,
            'data': "创建成功"
        };
    } catch (e) {
        console.log(e);
        return {
            'status': 400,
            'data': "服务器异常 稍后尝试"
        };
    }
}


async function getAllExperiment(teacher_id) {

    let experimentList = [];

    // 获取实验基本信息
    const teacher_has_exp = await db.sqlQuery('SELECT * FROM `user`.`__experiment` where exp_id in (select exp_id from `user`.__teacher_has_experiment where teacher_id = ?)',[teacher_id]);

    for (let i = 0; i < teacher_has_exp.data.length; i++) {
        let anExperiment = {};
        anExperiment["id"] = teacher_has_exp.data[i].exp_id;
        anExperiment["name"] = teacher_has_exp.data[i].exp_name;
        anExperiment['aim'] = teacher_has_exp.data[i].exp_aim;
        anExperiment['describe'] = teacher_has_exp.data[i].exp_describe;
        anExperiment['type'] = teacher_has_exp.data[i].exp_type;
        anExperiment['exp_table'] = teacher_has_exp.data[i].exp_table;
        anExperiment["createTime"] = teacher_has_exp.data[i].createTime.toLocaleDateString();
        anExperiment["reachTime"] = teacher_has_exp.data[i].startTime.toLocaleDateString();
        anExperiment["deadline"] = teacher_has_exp.data[i].endTime.toLocaleDateString();

        // 获取题目及问题
        let sql = `select * from \`user\`.\`__test\` where test_id in (SELECT test_id from \`user\`.\`__experiment_has_test\` where exp_id = ${teacher_has_exp.data[i].exp_id})`;

        let tests = await db.sqlQuery(sql);
        let group = [];
        for (let j = 0; j < tests.data.length; j++) {
            let a = {
                test_id: tests.data[j].test_id,
                problem: tests.data[j].test,
                answer: tests.data[j].answer,
                score: tests.data[j].score
            }
            group[j] = a;
        }
        anExperiment['group'] = group;
        experimentList.push(anExperiment);
    }



    return {
        'status': 200,
        'data': experimentList
    }
}


async function editExperiment(teacher_id, name, experiment) {

    // 1.更新实验表
    let sql = "update `user`.`__experiment` set `exp_aim`= ?,`exp_describe` = ?,`startTime`=?,`endTime`=? where `exp_id` = ?";

    await db.sqlQuery(sql, [experiment.aim, experiment.describe, experiment.reachTime, experiment.deadline, experiment.id]);

    // 2 修改题目

    // 2修改题目 修改方式待修改 不使用删除表的方式 过于危险
    for (let i = 0; i < experiment.group.length; i++) {
        let sql = "update `user`.`__test` set `test`= ?,`answer` = ? where `test_id` = ?";
        await db.sqlQuery(sql, [experiment.group[i].problem, experiment.group[i].answer, experiment.group[i].test_id]);
    }

    return {
        'status': 200,
        'data': 'success'
    }


}

async function getVisibleExperiment(student_id) {
    // 获得当前可见的实验 可见日期<当前日期<截止日期
    let nowTime = new Date().toLocaleDateString();
    let sql = 'select * from `user`.`__experiment` where exp_id in (' +
        'select exp_id from `user`.`__teacher_has_experiment` where teacher_id = (' +
        'select teacher_id from `user`.`__teacher_has_class` where class_id = (' +
        'select class_id from `user`.`__class_has_student` where student_id = ?))) and ' +
        'startTime < ? and endTime > ?'
    const experiments = await db.sqlQuery(sql, [student_id, nowTime, nowTime ]);
    let arr = [];
    for (let i = 0; i < experiments.data.length; i++) {
        let exp = {};
        exp.id = experiments.data[i].exp_id;
        exp.name = experiments.data[i].exp_name;
        arr.push(exp);
    }
    return {
        'status': 200,
        'data': arr
    }
}


async function getExperimentInfo(exp_id) {
    // 获取实验基本信息
    const result1 = await db.sqlQuery('SELECT * FROM `user`.`__experiment` where exp_id =?', [exp_id]);
    if (result1.data.length > 0) {
        let obj = {
            id: result1.data[0].exp_id,
            name: result1.data[0].exp_name,
            aim: result1.data[0].exp_aim,
            describe: result1.data[0].exp_describe,
            table: result1.data[0].exp_table,
            deadline: result1.data[0].endTime.toLocaleDateString()
        }

        return {
            'status': 200,
            'data': obj
        }
    } else {
        return {
            'status': 400,
            'data': '请求参数错误'
        }
    }


}

async function getTest(exp_id) {

    // 获取题目及关联库表
    let test = {};
    //let test_id = await db.sqlQuery("select test_id from `" + teacher_id + "`.`__test where `")
    // 查找教师
    let sql = 'select teacher_id from `user`.`__teacher_has_experiment` where exp_id = ?';
    let sql_teacher_id = (await db.sqlQuery(sql,[exp_id]));
    let teacher_id = sql_teacher_id.data[0].teacher_id
    // 查找题目
    sql = 'select * from `user`.`__test` where test_id in (select test_id from `user`.`__experiment_has_test` where exp_id = ?)';
    let target_test = await db.sqlQuery(sql,[exp_id]);
    let problems = [];
    for (let i = 0; i < target_test.data.length; i++) {
        problems[i] = target_test.data[i].test;
    }
    test["problems"] = problems;
    //查找关联库表
    const result1 = await db.sqlQuery('SELECT * FROM `user`.`__experiment` where exp_id = ?', [exp_id]);
    let tables = result1.data[0].exp_table.split("    ");
    // 去掉最后一项
    tables.pop();
    // 遍历
    let tablesArr = [];
    for (let i = 0; i < tables.length; i++) {
        let table = {};
        table["tableName"] = tables[i];
        // sql = "select * from `" + teacher_id + "`.`" + tables[i] + "`";
        // let t = await db.sqlQuery(sql);
        let t = await db.sqlQuery("select * from `dboj_" + teacher_id + "`.`" + tables[i] + "`");
        let field = new Map();
        for (let j = 0; j < t.fields.length; j++) {
            field.set(t.fields[j].name, toSqlType(t.fields[j].type));
        }
        let obj = Object.create(null);
        for (let [k, v] of field) {
            obj[k] = v;
        }
        table["field"] = obj;

        let rows = [];
        for (let j = 0; j < t.data.length; j++) {

            let aRow = "";
            for (let a in t.data[j]) {
                aRow = aRow + t.data[j][a] + "$$$";
            }
            rows[j] = aRow;
        }
        table["rows"] = rows;
        tablesArr[i] = table;
    }
    test["tables"] = tablesArr;

    return {
        'status': 200,
        'data': test
    }
}


// 学生测试创建临时表
async function createTestTmpTable(student_id, exp_id) {

    // 查找需要的表
    //查找关联库表
    const result1 = await db.sqlQuery('SELECT * FROM `user`.`__experiment` where `exp_id` = ?', [exp_id]);
    let tablesArr = result1.data[0].exp_table.split("    ");
    // 去掉最后一项
    tablesArr.pop();

    //查找教师
    let sql = 'select teacher_id from `user`.`__teacher_has_class` where class_id in (select class_id from `user`.`__class_has_student` where student_id = ?)'
    let temp_teacher_id = await db.sqlQuery(sql, [student_id]);
    let teacher_id = temp_teacher_id.data[0].teacher_id;

    for (let i = 0; i < tablesArr.length; i++) {
        // 为了安全 先进行删除操作
        let tempname = "`temp__dboj_" + teacher_id + "`.`" + tablesArr[i] + "`";


        sql = "DROP table if EXISTS " + tempname;

        await db.sqlQuery(sql);

        // 创建表
        let t_table = "`dboj_" + teacher_id + "`.`" + tablesArr[i] + "`";

        sql = "create table " + tempname + " like " + t_table;

        await db.sqlQuery(sql);

        sql = "insert into " + tempname + " select * from " + t_table;

        await db.sqlQuery(sql);
    }

    return {
        'status': 200,
        'data': '成功加载临时表'
    };
}



async function runTestSql(id, teacher_id, test_name, sql) {
    // 获取教师id
    let get_teacher_sql = 'SELECT * FROM `user`.`__teacher` where `id` in (select teacher_id from `user`.`__teacher_has_class` where class_id in (select class_id from `user`.`__class_has_student` where student_id = ?))'
    let temp_teacher_id = await db.sqlQuery(get_teacher_sql,[id]);
    teacher_id = temp_teacher_id.data[0].id;
    // 获取表
    // 查找需要的表
    //查找关联库表
    const result1 = await db.sqlQuery('SELECT * FROM `user`.`__experiment` where `exp_id` = ?', [test_name]);
    let tablesArr = result1.data[0].exp_table.split("    ");
    // 去掉最后一项
    tablesArr.pop();

    // 分析sql

    let sqls = anlayzeSql(sql);

    // 暂不支持多语句操作

    // if (sqls.sqlCount > 1) {
    //     return {
    //         'status': -1,
    //         'data': "暂不支持多语句操作"
    //     };
    // }
    if (sqls.type[0] == "DML") {
        // 替换学生sql中的数据库名
        for (let i = 0; i < tablesArr.length; i++) {
            sqls.sqls[0] = "use `temp__dboj_" + teacher_id + "`;"+sqls.sqls[0];
        }

        // 执行操作
        // 优先级
        // update == insert == delete > select
        if (sqls.sqls[0].indexOf("update") != -1 || sqls.sqls[0].indexOf("insert") != -1 || sqls.sqls[0].indexOf("delete") != -1) {
            // update/insert/delete
            try {
                let sql = sqls.sqls[0];
                let result = await db.sqlQueryMuti(sql);
                return {
                    'status': 200,
                    'data': {
                        'type': 1,
                        'msg': "> Affected Rows " + result.data.affectedRows
                    }
                }
            } catch (error) {
                return {
                    'status': 201,
                    'data': error.sqlMessage
                };
            }
        } else {
            // select
            try {
                let sql = sqls.sqls[0];
                let result = await db.sqlQueryMuti(sql);
                // 先保存字段
                let fields = [];
                for (let i = 0; i < result.fields.length; i++) {
                    fields[i] = result.fields[1][i].name;
                }
                // 保存data
                let rows = [];
                for (let i = 0; i < result.data.length; i++) {
                    let aRow = "";
                    for (let a in result.data[1][i]) {
                        aRow = aRow + result.data[1][i][a] + "$$$";
                    }
                    if (aRow !== ""){
                        rows[i] = aRow;
                    }

                }
                let msg = {
                    fields,
                    rows
                };
                return {
                    'status': 200,
                    'data': {
                        'type': 2,
                        'msg': msg
                    }
                };

            } catch (error) {
                if (error.sqlMessage == "No database selected") {
                    // console.log("使用未知的库表");
                    return {
                        'status': 201,
                        'data': '使用未知的库表'
                    };
                } else {
                    return {
                        'status': 201,
                        'data': error.sqlMessage
                    };
                }
            }

        }

    } else {
        if (sqls.type[0] != "NULL") {
            return {
                'status': 201,
                'data': "暂不支持" + sqls.type[0] + "类型操作"
            };
        } else {
            return {
                'status': 201,
                'data': "未知操作类型" + ",暂不支持"
            };
        }
    }
}

function isObjectValueEqual(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i]

        var propA = a[propName]
        var propB = b[propName]
        if ((typeof (propA) === 'object')) {
            if (isObjectValueEqual(propA, propB)) {
                // return true     这里不能return ,后面的对象还没判断
            } else {
                return false
            }
        } else if (propA !== propB) {
            return false
        } else { }
    }
    return true
}


async function testSubmit(id, exp_id, answerArr) {
    try {
    let subT = new Date().toLocaleDateString();
    // 查找老师
    let get_teacher_sql = 'select * from `user`.`__teacher` where id in (select teacher_id from `user`.`__teacher_has_experiment` where  exp_id = ?)' ;
    let temp_teacher = await db.sqlQuery(get_teacher_sql,[exp_id]);
    let teacher_key = temp_teacher.data[0].id;
    // 查找答案
    let sql = 'select * from `user`.`__test` where test_id in (select test_id from `user`.`__experiment_has_test` where  exp_id = ?)' ;
    let tests = await db.sqlQuery(sql,[exp_id]);
    let correctArr = [];
    for (let i = 0; i < tests.data.length; i++) {
        correctArr[i] = tests.data[i].answer;
    }
    // 比较答案
    // 答案是否正确的序列 y n
    let record = [];

    for (let i = 0; i < correctArr.length; i++) {

        // 处理自己的答案 多余空格只保留一个 去除前后答案
        answerArr[i] = answerArr[i].replace(/\s+/g, ' ');
        answerArr[i] = answerArr[i].trim();
        let temp = correctArr[i].split("$$$");

        sql = correctArr[i];
        sql = "use `temp__dboj_" + teacher_key + "`;"+sql;
        let correctSql = await db.sqlQueryMuti(sql);
        sql = answerArr[i];
        sql = "use `temp__dboj_" + teacher_key + "`;"+sql;
        let answerSql = await db.sqlQueryMuti(sql);


        for (let k = 0; k < temp.length; k++) {
            //若运行结果相同，写入成绩表并记为正确
            if (isObjectValueEqual(correctSql.data[1], answerSql.data[1])) {
                sql = 'insert into `user`.`__mark` values (?,?,?,?,?,?,?,?)';
                await db.sqlQuery(sql,[tests.data[i].test_id, id, 1, subT, 0, tests.data[i].score, answerArr[i], 1]);
            } else {
                //若运行结果不同，写入成绩表并记为错误
                sql = 'insert into `user`.`__mark` values (?,?,?,?,?,?,?,?)';
                await db.sqlQuery(sql,[tests.data[i].test_id, id, 1, subT, 0, tests.data[i].score, answerArr[i], 0]);
            }
        }
    }

        return {
            'status': 200,
            'data': "提交成功"
        };
    } catch (error) {
        console.log(error)
        return {
            'status': 400,
            'data': "提交失败"
        };
    }

}



async function getGrade(id, test_id) {
    // 获得成绩
    let data = {};
    let sql = "select * from `user`.`__mark` where student_id = ? and test_id in (select test_id from `user`.`__experiment_has_test` where exp_id = ?)";
    let result = await db.sqlQuery(sql, [id, test_id]);
    // 若未完成则返回未完成即可
    if (result.data[0].isFinish != undefined && result.data[0].isFinish == 0) {
        return {
            'status': 201,
            'data': '该实验尚未完成'
        }
    } else if (result.data[0].isFinish != undefined && result.data[0].isFinish == 1) {
        //获取实验名
        sql = 'select * from `user`.`__experiment` where exp_id = ?';
        let exp_name = await db.sqlQuery(sql,[test_id]);
        exp_name = exp_name.data[0].exp_name;
        data.exp_name = exp_name;
        //获取试题属性
        sql = 'select * from `user`.`__test` where test_id in (select test_id from `user`.`__mark` where student_id = ? and test_id in (select test_id from `user`.`__experiment_has_test` where exp_id = ?))';
        let result2 = await db.sqlQuery(sql,[id, test_id]);
        //记录学生成绩
        let full_mark = 0;
        let output = [];

        for(let i=0;i<result.data.length;i++){
            let tmp = {};
            if(result.data[i].isCorrect){
                full_mark += result.data[i].mark;
            }
            tmp.mark = result.data[i].mark;
            tmp.test = result2.data[i].test;
            tmp.answer = result.data[i].answer;
            tmp.isCorrect = result.data[i].isCorrect;
            tmp.subTime = formatDate(result.data[i].subTime);
            output.push(tmp);
        }
        data.full_mark = full_mark;
        data.output = output;

        return {
            'status': 200,
            'data': data
        }
    } else {
        return {
            'status': 400,
            'data': '服务器错误'
        }
    }


}

function formatDate(date, format) {
    if (!date) return;
    if (!format)
        format = "yyyy-MM-dd";
    switch (typeof date) {
        case "string":
            date = new Date(date.replace(/-/, "/"));
            break;
        case "number":
            date = new Date(date);
            break;
    }
    if (!date instanceof Date) return;
    var dict = {
        "yyyy" : date.getFullYear(),
        "M" : date.getMonth() + 1,
        "d" : date.getDate(),
        "H" : date.getHours(),
        "m" : date.getMinutes(),
        "s" : date.getSeconds(),
        "MM" : ("" + (date.getMonth() + 101)).substr(1),
        "dd" : ("" + (date.getDate() + 100)).substr(1),
        "HH" : ("" + (date.getHours() + 100)).substr(1),
        "mm" : ("" + (date.getMinutes() + 100)).substr(1),
        "ss" : ("" + (date.getSeconds() + 100)).substr(1)
    };
    return format.replace(/(yyyy|MM?|dd?|HH?|ss?|mm?)/g, function() {
        return dict[arguments[0]];
    });
}





module.exports = {
    createExperiment,
    getAllExperiment,
    editExperiment,
    getVisibleExperiment,
    getExperimentInfo,
    getTest,
    createTestTmpTable,
    runTestSql,
    testSubmit,
    getGrade
};
