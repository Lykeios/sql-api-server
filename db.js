// db.js
const mysql = require('mysql')

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '!momiji1',
    port: '3306',
    // typeCast:'false'
    // 不指定数据库
})
var poolMuti = mysql.createPool({
    host     : '127.0.0.1',
    user     : 'root',
    password : '!momiji1',
    port       : '3306',
    multipleStatements: true//创建时允许多语句
});
const sqlQuery = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err)
            } else {
                if (values) {
                    connection.query(sql, values, (err, data,fields) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve({data,fields})
                        }
                        connection.release()
                    })
                } else {
                    connection.query(sql, (err, data,fields) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve({data,fields})
                        }
                        connection.release()
                    })
                }
            }
        })
    })
}


const sqlQueryMuti = (sql, values) => {
    return new Promise((resolve, reject) => {
        poolMuti.getConnection((err, connection) => {
            if (err) {
                reject(err)
            } else {
                if (values) {
                    connection.query(sql, values, (err, data,fields) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve({data,fields})
                        }
                        connection.release()
                    })
                } else {
                    connection.query(sql, (err, data,fields) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve({data,fields})
                        }
                        connection.release()
                    })
                }
            }
        })
    })
}

module.exports = { sqlQuery,sqlQueryMuti }
