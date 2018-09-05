var express = require('express');
var router = express.Router();
var dbConn = require('./dbConnect');

router.post('/', function (req, res, next) {
    var sql = "SELECT " +
        "	DATE_FORMAT(tt.createTime, '%m-%d %H:%i') as createTime, " +
        "	tt.s, " +
        "	tt.p, " +
        "	tt.f, " +
        "	tt.rs, " +
        "	tt.rp, " +
        "	tt.rf " +
        "FROM " +
        "	odds tt " +
        "WHERE " +
        "	tt.dataDate = STR_TO_DATE(?, '%Y-%m-%d') " +
        "AND tt.gameNo = ? " +
        "ORDER BY " +
        "	createTime";
    var paramArr = [];
    paramArr.push(req.body.dataDate);
    paramArr.push(req.body.gameNo);
    dbConn.query(sql, paramArr, function (result){
        res.json({data: result});
    });
});

module.exports = router;