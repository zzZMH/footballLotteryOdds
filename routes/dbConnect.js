var mysql = require('mysql');
var dbConfig = require('./dbconfig');

var dbConn = {
    query: function (sql, params, callback) {
        var connection = mysql.createConnection(dbConfig);
        connection.connect(function (err) {
            if (err) {
                console.log('数据库连接初始化异常：' + err);
                throw err;
            }
            connection.query(sql, params, function (err, results, fields) {
                if (err) {
                    console.log('数据操作异常：' + err);
                    throw err;
                }
                callback && callback(results);
                connection.end(function (err) {
                    if (err) {
                        console.log('数据库连接关闭异常：' + err);
                        throw err;
                    }
                });
            });
        });
    }
};

module.exports = dbConn;