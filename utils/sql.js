
function analyzeSql(sql) {
    sql = sql.toString();
    // 判断sql
    // 1.数量
    // 2.类型
    // a.先转换为小写
    //sql = sql.toLowerCase();
    // b.分割
    let sqls = sql.split(";");
    // 若最后一项为空 说明最后一句sql语句加了分号 直接pop
    // 保留中间的空语句 不进行处理
    if (sqls[sqls.length - 1] == "") {
        sqls.pop();
    }
    // 记录长度
    let sqlCount = sqls.length;

    //判断类型
    //判断句子类型 每一句都要进行判断 无法判断的标记为null
    //类型划分 DDL DML DCL NULL
    //DDL 数据定义语言 create drop alter
    //DML 数据操作语言 select insert update delete
    //DCL 数据控制语言 commit rollback revoke grant
    const DDL = ["create", "drop", "alter", "CREATE", "DROP", "ALTER"];
    const DML = ["select", "insert", "update", "delete", "SELECT", "INSERT", "UPDATE", "DELETE"];
    const DCL = ["commit", "rollback", "revoke", "grant", "COMMIT", "ROLLBACK", "REVOKE", "GRANT"];
    // 从安全角度出发 暂时只能处理DML类型的操作
    // 其余操作会对表的关系及数据结构产生不可预知错误 暂时不支持
    // 按照优先级判断 DDL>DML>DCL
    let type = [];
    for (let i = 0; i < sqls.length; i++) {
        //用于标记当前语句是否已经有类型
        let tax = false;
        //DDL
        if (!tax) {
            for (let ddl = 0; ddl < DDL.length; ddl++) {
                //包含ddl中任意一个关键字
                if (sqls[i].indexOf(DDL[ddl])!=-1) {
                    type[i] = "DDL";
                    tax = true;
                }
            }
        }
        //            DML
        if (!tax) {
            for (let dml = 0; dml < DML.length; dml++) {
                //                包含ddl中任意一个关键字
                if (sqls[i].indexOf(DML[dml])!=-1) {
                    type[i] = "DML";
                    tax = true;
                }
            }
        }
        // DCL
        if (!tax) {
            for (let dcl = 0; dcl < DCL.length; dcl++) {
                //                包含ddl中任意一个关键字
                if (sqls[i].indexOf(DCL[dcl])!=-1) {
                    type[i] = "DCL";
                    tax = true;
                }
            }
        }
        //             NULL
        if (tax == false) {
            type[i] = "NULL";
        }
    }

    let result ={
        sqls,
        type,
        sqlCount
    };
    return result;

}

module.exports = analyzeSql;
