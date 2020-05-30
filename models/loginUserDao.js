// db
const db = require('../db');


// 登录
async function login(id, pwd, type) {

    // 查询
    const result1 = await db.sqlQuery(`select * from \`user\`.\`__${type}\` where ${type}_id = ${id} and pwd = ${pwd}`);

    // 账号正确
    if (result1.data.length > 0) {
        // 删除密码 返回
        delete result1.data[0].pwd
        // 封装对象
        return {
            "status": 200,
            "meta": {
                "data": result1.data[0]
            }
        };
    } else {
        return {
            "status": 201,
            "meta": {
                "data": null
            }
        };
    }

}


// 修改密码
async function changePwd(id, old_pwd, new_pwd, type) {
    // 判断密码正确
    const result1 = await db.sqlQuery(`select * from \`user\`.\`__${type}\` where ${type}_id = ${id} and pwd = ${old_pwd}`);
    if (result1.data.length == 0) {
        return {
            'status': 201,
            'data': '密码错误'
        };
    } else {
        const r = await db.sqlQuery(`update \`user\`.\`__${type}\` set pwd = ${new_pwd} where ${type}_id = ${id}`);
        if (r.data.changedRows > 0) {
            return {
                'status': 200,
                'data': '修改成功'
            };;
        } else {
            return {
                'status': 400,
                'data': '服务器错误'
            };
        }
    }
}




async function root(form) {
    // console.log(form)
         // 检验密码
    let sql = 'select * from `user`.`__admin` where `pwd` = ?';
    let result1 = await db.sqlQuery(sql, [form.pwd]);

    if (result1.data.length > 0) {
        // 检查教师是否存在
        sql = 'select * from `user`.`__teacher` where `teacher_id` = ?';
        let result2 = await db.sqlQuery(sql, [form.teacher_id]);
        if (result2.data.length > 0) {
            return {
                'status': 201,
                'data': '教师已存在'
            };
        } else {
            // 创建教师
            sql = "insert into `user`.`__teacher` values(?,?,?,?)";
            let newTeacher = await db.sqlQuery(sql, [null, form.teacher_id, '123456', form.teacher_name]);
            //新建实验用库表
            sql = "create Database `dboj_" + newTeacher.data.insertId + "` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci";
            await db.sqlQuery(sql);
            //新建实验用库表备份
            sql = "create Database `temp__dboj_" + newTeacher.data.insertId + "` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci";
            await db.sqlQuery(sql);
            //新建实验表
            sql = "CREATE TABLE if not EXISTS `user`.`__experiment`( " +
                "`exp_id` int(11) primary key auto_increment," +
                "`exp_name` VARCHAR(255), " +
                "`exp_aim` VARCHAR(500), " +
                "`exp_describe` text, " +
                "`exp_type` tinyint(1) default '0' comment '0为实践类，1为设计类', " +
                "`exp_table` VARCHAR(500), " +
                "`createTime` date, " +
                "`startTime` date, " +
                "`endTime` date )" +
                " charset = utf8";
            await db.sqlQuery(sql);
            //新建班级表
            sql = "CREATE TABLE if not EXISTS `user`.`__class`( " +
                "`id` int(11) primary key auto_increment, " +
                "`class_id` VARCHAR(12))" +
                " charset = utf8";
            await db.sqlQuery(sql);
            //新建试题表
            sql = "CREATE table if not EXISTS `user`.`__test` (" +
                "`test_id` int(11) primary key auto_increment not null ," +
                "`test_type` tinyint(1) default '0' comment '0为实践类，1为设计类' ," +
                "`score` int(3) not null ,"+
                "`test` varchar(1000) ," +
                "`answer` text null)" +
                " charset = utf8";
            await db.sqlQuery(sql);
            //新建成绩表
            sql = "CREATE table if not EXISTS `user`.`__mark` (" +
                "`test_id` int(11) not null," +
                "`student_id` int(11)  not null," +
                "`isFinish` tinyint(1)," +
                "`subTime` date ," +
                "`subCount` int(7) ," +
                "`mark` int(3)," +
                "`answer` text," +
                "`isCorrect` tinyint(1)," +
                " primary key (test_id, student_id ))" +
                " charset = utf8";
            await db.sqlQuery(sql);
            //新建教师-班级映射表
            sql = "CREATE table if not EXISTS `user`.`__teacher_has_class` (" +
                "`teacher_id` int(11) not null," +
                "`class_id` int(11) not null )";
            await db.sqlQuery(sql);
            //新建学生-班级映射表
            sql = "CREATE table if not EXISTS `user`.`__class_has_student` (" +
                " `class_id` int(11) not null," +
                " `student_id` int(11) not null)";
            await db.sqlQuery(sql);
            //新建教师-实验映射表
            sql = "CREATE table if not EXISTS `user`.`__teacher_has_experiment` (" +
                "`teacher_id` int(11) not null," +
                "`exp_id` int(11) not null )";
            await db.sqlQuery(sql);
            //新建实验-试题映射表
            sql = "CREATE table if not EXISTS `user`.`__experiment_has_test` (" +
                " `exp_id` int(11) not null," +
                " `test_id` int(11) not null)";
            await db.sqlQuery(sql);
            return {
                'status': 200,
                'data': '成功'
            };
        }
    } else {
        return {
             'status': 201,
            'data': '密码错误'
        };
    }
}




module.exports = {
    login,
    changePwd,
    root
};
