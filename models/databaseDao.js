// db
const db = require('../db');
// 数字转为sql类型
const toSqlType = require('../utils/type');
// 分析sql
const anlayzeSql = require('../utils/sql');

async function getTableFromDatabase(id) {
    let sql = `SELECT table_name  FROM information_schema.TABLES WHERE table_schema = 'dboj_${id}'`;
    // 查询
    const result1 = await db.sqlQuery(sql);
    let tableArr = [];
    for (let table of result1.data) {
        // 过滤 开头有双下划线的为系统生成表 不进行返回
        if (table.TABLE_NAME.substr(0, 2) != "__") {
            tableArr.push(table.TABLE_NAME);
        }
    }
    return {
        'status': 200,
        'data': tableArr
    }

}


async function getACompleteTable(id, name) {
    try {
        let table = {};
        let sql = "select * from `dboj_" + id + "`.`" + name + "`";
        let t = await db.sqlQuery(sql);
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
            // 每一行的内容
            let aRow = "";
            for (let a in t.data[j]) {
                aRow = aRow + t.data[j][a] + "$$$";
            }
            rows[j] = aRow;
        }
        table["rows"] = rows;
        return {
            'status': 200,
            'data': table
        };
    } catch (error) {
        return {
            'status': 400,
            'data': error
        }
    }
}


async function script(id, script) {
    try {
        let d = await db.sqlQueryMuti("use `dboj_" + id + "`;" + script);
        return {
            'status': 200,
            'msg': '执行成功'
        }
    } catch (error) {
        return {
            'status': 201,
            'data': error.sqlMessage
        };
    }
}

async function deleteTable(id, table) {
    let sql = "drop table if exists `dboj_" + id + "`.`" + table + "`";
    await db.sqlQuery(sql);
    return {
        'status': 200,
        'data': "删除成功"
    };
}


async function createTmpTable(teacher_id) {

    let sql = `SELECT table_name  FROM information_schema.TABLES WHERE table_schema = 'dboj_${teacher_id}'`;
    // 查询拥有的表
    const result1 = await db.sqlQuery(sql);
    let tablesArr = [];
    for (let table of result1.data) {
        // 过滤 开头有双下划线的为系统生成表 不进行返回
        if (table.TABLE_NAME.substr(0, 2) != "__") {
            tablesArr.push(table.TABLE_NAME);
        }
    }

    for (let i = 0; i < tablesArr.length; i++) {
        // 为了安全 先进行删除操作
        let tempname = "`temp__dboj_" + teacher_id + "`.`" + tablesArr[i] + "`";
        sql = "DROP table if EXISTS " + tempname;
        let result = await db.sqlQuery(sql);
        // 创建表
        let t_table = "`dboj_" + teacher_id + "`.`" + tablesArr[i] + "`";
        sql = "create table " + tempname + " like " + t_table;
        let re = await db.sqlQuery(sql);
        sql = "insert into " + tempname + " select * from " + t_table;
        await db.sqlQuery(sql);
    }
    return {
        'status': 200,
        'data': "临时表创建成功"
    }
}


async function runSql(teacher_id, sql) {
    await createTmpTable(teacher_id);
    // 分析sql
    let sqls = anlayzeSql(sql);


    // if (sqls.sqlCount > 1) {
    //     return {
    //         'status': 201,
    //         'data': "暂不支持多语句操作"
    //     };
    // }

    if (sqls.type[0] == "DML") {
        // 处理数据库
        let tablesArr = [];

        let sql = `SELECT table_name  FROM information_schema.TABLES WHERE table_schema = '${teacher_id}'`;
        // 查询拥有的表
        const result1 = await db.sqlQuery(sql);

        for (let table of result1.data) {
            // 过滤 开头有双下划线的为系统生成表 不进行返回
            if (table.TABLE_NAME.substr(0, 2) != "__") {
                tablesArr.push(table.TABLE_NAME);
            }
        }


        sqls.sqls[0] = "use `temp__dboj_" + teacher_id + "`;"+sqls.sqls[0];
        // console.log(sqls.sqls[0]);
        // 执行操作
        // 优先级
        // update == insert == delete > select
        if (sqls.sqls[0].indexOf("update") != -1 ||
            sqls.sqls[0].indexOf("insert") != -1 ||
            sqls.sqls[0].indexOf("delete") != -1 ||
            sqls.sqls[0].indexOf("UPDATE") != -1 ||
            sqls.sqls[0].indexOf("INSERT") != -1 ||
            sqls.sqls[0].indexOf("DELETE") != -1) {

            try {
                let sql = sqls.sqls[0];
                let result = await db.sqlQueryMuti(sql);

                //执行完毕后返回全表数据

                return {
                    'status': 200,
                    'data': {
                        'type': 1,
                        'msg': "> Affected Rows " + result.data[1].affectedRows
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
                for (let i = 0; i < result.fields[1].length; i++) {
                    fields[i] = result.fields[1][i].name;
                }
                // 保存data
                let rows = [];
                for (let i = 0; i < result.data[1].length; i++) {
                    let aRow = "";
                    for (let a in result.data[1][i]) {
                        aRow = aRow + result.data[1][i][a] + "$$$";
                    }
                    if(aRow.length !== 0)
                        rows[i] = aRow;
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
module.exports = {
    getTableFromDatabase,
    getACompleteTable,
    script,
    deleteTable,
    createTmpTable,
    runSql
};
