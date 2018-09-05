var express = require('express');
var router = express.Router();
var dbConn = require('./dbConnect');

router.post('/', function (req, res, next) {
    var sql = "SELECT DISTINCT " +
        "	DATE_FORMAT(t.dataDate, '%Y-%m-%d') AS dataDate," +
        "	t.gameNo ," +
        "	t.teamZ, " +
        "	t.teamK, " +
        "	t.diffBall " +
        "FROM " +
        "	odds t " +
        "WHERE " +
        "	t.endTime > now() " +
        "ORDER BY " +
        "	dataDate, " +
        "	t.gameNo + 0 ";
    dbConn.query(sql, [], function (result){
        res.json({data: result});
    });
});

module.exports = router;