// db
const db = require('../db');


async function getClassInfo(teacher_id) {
    let myClass = [];
    let sql = 'select * from `user`.`__class` where id in (select class_id from `user`.`__teacher_has_class` where teacher_id = ?)' ;
    let teacherHasClass = await db.sqlQuery(sql,[teacher_id]);
    for (let i = 0; i < teacherHasClass.data.length; i++) {
        let AClass = {};
        AClass["id"] = teacherHasClass.data[i].id;
        AClass["class_id"] = teacherHasClass.data[i].class_id;
        sql = 'select * from `user`.`__student` where id in (select student_id from `user`.`__class_has_student` where class_id = ?)';
        let students = [];
        let studentResults = await db.sqlQuery(sql,[teacherHasClass.data[i].id]);
        for (let j = 0; j < studentResults.data.length; j++) {
            let Astudent = {};
            Astudent["id"] = studentResults.data[j].id;
            Astudent["student_id"] = studentResults.data[j].student_id;
            Astudent["name"] = studentResults.data[j].student_name;
            students[j] = Astudent;
        }
        AClass["student"] = students;
        myClass[i] = AClass;
    }
    return {
        'status': 200,
        'data': myClass
    };
}

async function deleteAStudent(student_id) {
    try {

        let sql = 'delete from `user`.`__class_has_student` where student_id = ?';
        await db.sqlQuery(sql, [student_id]);

        sql = "DELETE FROM `user`.`__student` WHERE id = ?";
        await db.sqlQuery(sql, [student_id]);
        return {
            'status': 200,
            'data': '删除成功'
        };
    } catch (error) {
        return {
            'status': 400,
            'data': error.sqlMessage
        };
    }
}

async function addAStudent(teacher_id, student) {
    try {
        // 判断是否注册
        let sql = "select * from `user`.`__student` where student_id = ?";
        let result1 = await db.sqlQuery(sql, [student.student_id]);
        if (result1.data.length > 0) {
            return {
                'status': 201,
                'data': "该学号已注册"
            };
        }
        // 先注册
        sql = "insert into `user`.`__student` values(?,?,?,?)";
        let newStudent = await db.sqlQuery(sql, [null, student.student_id, "123456", student.name]);
        // 加入班级
        sql = "insert into `user`.`__class_has_student` values (?,?)";
        result1 = await db.sqlQuery(sql, [student.class_key, newStudent.data.insertId]);
        return {
            'status': 200,
            'data': "添加成功"
        };

    } catch (error) {
        return {
            'status': 400,
            'data': "服务器异常"
        };
    }
}

async function deleteAClass(id) {
    try {
        // 从班级表中删除
        // sql = "DELETE FROM `" + id + "`.`__class` WHERE `id` = ?";
        // await db.sqlQuery(sql, [class_id]);
        let sql = 'DELETE FROM `user`.`__teacher_has_class` WHERE `class_id` = ?';
        await db.sqlQuery(sql,[id]);

        // 注销注册
        sql = 'DELETE FROM `user`.`__class` WHERE `id` = ?';
        await db.sqlQuery(sql, [id]);



        return {
            'status': 200,
            'data': "删除成功"
        };

    } catch (error) {
        return {
            'status': 400,
            'data': "服务器错误:" + error.sqlMessage
        }
    }
}





async function importAClass(teacher_key, class_id, classObj) {
    // 查找班级是否存在
    let sql = 'select * from `user`.`__class` where `class_id` = ?';
    let result = await db.sqlQuery(sql, [class_id]);
    if (result.data.length > 0) {
        return {
            'status': 201,
            'data': "该班级已存在"
        };
    }
    // 添加班级
    sql = 'insert into `user`.`__class` values(?,?)';
    let newClass = await db.sqlQuery(sql, [null, class_id]);
    sql = 'insert into `user`.`__teacher_has_class` values(?,?)';
    await db.sqlQuery(sql, [teacher_key, newClass.data.insertId]);


    // 处理班级中的重复id

    // 循环ClassObj
    // 步骤1:注册 若存在 加入错误信息 不存在正常注册
    // 步骤2:加入班级 前端已处理 不会重复
    // 已注册信息 作为返回值返回
    let exist = [];
    for (let i = 0; i < classObj.length; i++) {
        // 检查是否注册
        sql = 'select * from `user`.`__student` where `student_id` = ?';
        let result2 = await db.sqlQuery(sql, [classObj[i].id]);
        if (result2.data.length > 0) {
            exist.push(classObj[i].id);
        } else {
            // 注册
            sql = "insert into `user`.`__student` values(?,?,?,?)";
            let newStudent = await db.sqlQuery(sql, [null, classObj[i].id, "123456", classObj[i].name]);
            // 加入班级
            sql = 'insert into `user`.`__class_has_student` values(?,?)';
            await db.sqlQuery(sql, [newClass.data.insertId, newStudent.data.insertId]);
        }
    }
    if (exist.length == 0) {
        return {
            'status': 200,
            'data': "班级导入成功"
        };
    } else {
        return {
            'status': 200,
            'data': '已导入, 其中 ' + exist.toString() + ' 已注册'
        };
    }

}

// 导出成绩
async function exportGrade(id, class_id) {
    let returnResult = [];
    // 根据class_id获取班级id
    let class_key = (await db.sqlQuery('SELECT id FROM `user`.`__class` where class_id = ?', [class_id])).data[0].id;
    let class_member = (await db.sqlQuery('select * from `user`.`__student` where id in (select student_id from `user`.`__class_has_student` where class_id = ?)', [class_key]));

    let sql = 'select * from `user`.`__mark`  where test_id in (select test_id from `user`.`__experiment_has_test` where exp_id in (select exp_id from `user`.`__teacher_has_experiment` where teacher_id =? )) order by (select student_id from `user`.`__student` where id in (select student_id from `user`.`__class_has_student` where class_id = ?))';
    let mark = await db.sqlQuery(sql, [id, class_key]);

    let Astudent = {};

    for (let i = 0; i < class_member.data.length; i++) {
        sql = 'select exp_name from `user`.`__experiment` where exp_id in (select exp_id from `user`.`__experiment_has_test` where  test_id = ?)';
        let exp_name = await db.sqlQuery(sql, [mark.data[i].test_id]);
        exp_name = exp_name.data[0].exp_name;
        let obj = {};
        obj['name'] = exp_name;
        let student = [];
        let full_mark = 0;
        for(let j=0;j < mark.data[i].length;j++){
            let tmp = {};
            if(mark.data[j].isCorrect){
                full_mark += mark.data[j].mark;
            }
        }

            Astudent = {
                id: class_member.data[i].student_id,
                name: class_member.data[i].student_name,
                grade: full_mark
            }
            student.push(Astudent);
        obj['student'] = student
        returnResult.push(obj);
    }
    // 返回结果集:
    // 返回格式需要时 [{id:name:实验A:实验B},{id:name:实验A:实验B}]


    // console.log(returnResult)
    // 封装对象
    // 假设每个实验的学生个数一样 不出bug
    let studentArr = [];
    for(let i = 0;i<returnResult[0].student.length;i++){
        studentArr.push({
            id:returnResult[0].student[i].id,
            name:returnResult[0].student[i].name
        })
    }
    // 遍历实验
    for(let i = 0;i<studentArr.length;i++){
        for(let j = 0 ; j<returnResult.length;j++){
            // console.log(returnResult[j])
            studentArr[i][returnResult[j].name]=returnResult[j].student[i].grade;
        }
    }

    return {
        'status': 200,
        'data': studentArr
    }
}


module.exports = {
    getClassInfo,
    deleteAStudent,
    addAStudent,
    deleteAClass,
    importAClass,
    exportGrade
};
