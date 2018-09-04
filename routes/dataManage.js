var db = require('./dbConnect');
var format = require('./formatDate');
var seg = require('superagent');
var jq = require('cheerio');
var comp = require('./compareDate');

var resultList = {
    init: function () {
        _this = this;
        var paramsList = [];
        var curTime = format.getFormatDate();
        var url = "http://caipiao.163.com/order/jczq-hunhe/?betDate=";
        seg.get(url).end(function (err, resp) {
            if (err) {
                return console.log(err);
            }
            var $ = jq.load(resp.text);
            //比赛列表
            $('.gameSelect').children().first().next().children().each(function (indexs, items) {
                var params = {};
                //日期
                var gameDate = $(items).children().first().html().substring(0, 10);
                params.gameDate = gameDate;
                params.curTime = curTime;
                params.gameData = [];
                //比赛详细信息
                $(items).find("dd").each(function (index, item) {
                    if (index % 2 === 0) {
                        var para = {};
                        if ($(item).css("display") !== "none") {
                            para.gameNo = $(item).children(".co1").children("i").html();//比赛场次
                            $(item).children(".co4").children("a").children("em").each(function (idx, itm) {
                                if (idx === 1) {
                                    para.teamNameK = $(itm).attr("title");
                                } else {
                                    para.teamNameZ = $(itm).attr("title");
                                }
                            });//主/客队名称
                            var times = $(item).children('.co3').children('i').attr("inf").split("<br/>");
                            for (var i = 0; i < times.length; i++) {
                                var tm = times[i].split("：");
                                if (i === 0) {
                                    var stopTimeStr = tm[1] + ":00";
                                    var stopTime = new Date(stopTimeStr.replace("-", "/"));
                                    var minute = stopTime.getMinutes();
                                    stopTime.setMinutes(minute + 3);
                                    para.stopTime = format.getFormatDate(stopTime);
                                } else {
                                    para.startTime = tm[1] + ":00";
                                }
                            }//开始/截止时间
                            var gameRate = [];
                            for (var i = 1; i < 3; i++) {
                                var rates = $(item).children('.co6_1').children('.line' + i).children("em");
                                var diffBall = $(rates[0]).html();
                                for (var j = 1; j < rates.length; j++) {
                                    var rate = {};
                                    rate.diffBall = diffBall;
                                    if (diffBall !== "0") {
                                        rate.spfType = parseInt($(rates[j]).attr("index")) + 3 + "";
                                        rate.spfRate = $(rates[j]).html();
                                    } else {
                                        rate.spfType = $(rates[j]).attr("index");
                                        rate.spfRate = $(rates[j]).html();
                                    }
                                    gameRate.push(rate);
                                }
                            }//赔率数据
                            para.gameRate = gameRate;
                            params.gameData.push(para);
                        }
                    }
                });
                paramsList.push(params);
            });
            _this.query(paramsList);
        });
    },
    query: function (paramsList) {
        if (paramsList && paramsList.length > 0) {
            for (var k = 0; k < paramsList.length; k++) {
                var params = paramsList[k];
                if (params) {
                    var gameDate = params.gameDate;
                    var curTime = params.curTime;
                    var dataList = params.gameData;//比赛场次
                    var dbDataList = [];
                    if (dataList && dataList.length > 0) {
                        for (var i = 0; i < dataList.length; i++) {//遍历比赛场次
                            var dbData = {};
                            var stopTime = dataList[i].stopTime;
                            var difDays = comp.diffDays(curTime, stopTime);
                            if (difDays <= 0) {//当前时间没过截止时间就存储数据
                                dbData.dataDate = gameDate;
                                dbData.gameNo = dataList[i].gameNo;
                                dbData.teamZ = dataList[i].teamNameZ;
                                dbData.teamK = dataList[i].teamNameK;
                                dbData.startTime = dataList[i].startTime;
                                dbData.endTime = stopTime;
                                dbData.createTime = curTime;
                                var rateList = dataList[i].gameRate;//赔率数据
                                if (rateList && rateList.length > 0) {
                                    for (var j = 0; j < rateList.length; j++) {//遍历赔率数据
                                        var rateType = rateList[j].spfType;
                                        var rateValue = rateList[j].spfRate;
                                        if (rateType === "0") {//胜
                                            dbData.s = rateValue;
                                        } else if (rateType === "1") {//平
                                            dbData.p = rateValue;
                                        } else if (rateType === "2") {//负
                                            dbData.f = rateValue;
                                        } else if (rateType === "3") {//让胜
                                            dbData.rs = rateValue;
                                        } else if (rateType === "4") {//让平
                                            dbData.rp = rateValue;
                                        } else {//让负
                                            dbData.diffBall = rateList[j].diffBall;
                                            dbData.rf = rateValue;
                                        }
                                    }
                                }
                                dbDataList.push(dbData);
                            }
                        }
                    }
                    this.modify(dbDataList);
                }
            }
        }

    },
    checkData: function (para, callBack) {
        var result = {};
        if (para) {
            var dataDate = para.dataDate;
            var gameNo = para.gameNo;
            var createTime = para.createTime;
            var sql = "SELECT count(1) as num " +
                "from odds " +
                "where dataDate = STR_TO_DATE(?,'%Y-%m-%d') " +
                "and gameNo = ? " +
                "and createTime = STR_TO_DATE(?,'%Y-%m-%d %H:%i:%s')";
            var paramsArr = [];
            paramsArr.push(dataDate);
            paramsArr.push(gameNo);
            paramsArr.push(createTime);
            db.query(sql, paramsArr, function (res) {
                result.flag = "suc";
                result.msg = res[0].num;
                result.data = para;
                return callBack(result);
            });
        } else {
            result.flag = "err";
            return callBack(result);
        }
    },
    modify: function (params) {
        if (params && params.length > 0) {
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                this.checkData(param, function (result) {
                    if (result && result.flag === "suc") {
                        var para = result.data;
                        var sql = "";
                        var paramsArr = [];
                        if (parseInt(result.msg) > 0) {
                            sql = "update odds " +
                                "set teamZ = ?, " +
                                "teamK = ?, " +
                                "startTime = STR_TO_DATE(?,'%Y-%m-%d'), " +
                                "endTime = STR_TO_DATE(?,'%Y-%m-%d'), " +
                                "diffBall = ?," +
                                "s = ?," +
                                "p = ?," +
                                "f = ?," +
                                "rs = ?," +
                                "rp = ?," +
                                "rf = ?" +
                                "where dataDate = STR_TO_DATE(?,'%Y-%m-%d') " +
                                "and gameNo = ? " +
                                "and createTime = STR_TO_DATE(?,'%Y-%m-%d %H:%i:%s')";
                            paramsArr = [];
                            paramsArr.push(para.teamZ);
                            paramsArr.push(para.teamK);
                            paramsArr.push(para.startTime);
                            paramsArr.push(para.endTime);
                            paramsArr.push(para.diffBall);
                            paramsArr.push(para.s);
                            paramsArr.push(para.p);
                            paramsArr.push(para.f);
                            paramsArr.push(para.rs);
                            paramsArr.push(para.rp);
                            paramsArr.push(para.rf);
                            paramsArr.push(para.dataDate);
                            paramsArr.push(para.gameNo);
                            paramsArr.push(para.createTime);
                            db.query(sql, paramsArr);
                        } else {
                            sql = "insert into odds(" +
                                "dataDate," +
                                "gameNo," +
                                "teamZ," +
                                "teamK," +
                                "startTime," +
                                "endTime," +
                                "diffBall," +
                                "createTime," +
                                "s," +
                                "p," +
                                "f," +
                                "rs," +
                                "rp," +
                                "rf) values(" +
                                "STR_TO_DATE(?,'%Y-%m-%d'), " +
                                "?, " +
                                "?, " +
                                "?, " +
                                "STR_TO_DATE(?,'%Y-%m-%d %H:%i:%s'), " +
                                "STR_TO_DATE(?,'%Y-%m-%d %H:%i:%s'), " +
                                "?, " +
                                "STR_TO_DATE(?,'%Y-%m-%d %H:%i:%s'), " +
                                "?, " +
                                "?, " +
                                "?, " +
                                "?, " +
                                "?, " +
                                "?)";
                            paramsArr = [];
                            paramsArr.push(para.dataDate);
                            paramsArr.push(para.gameNo);
                            paramsArr.push(para.teamZ);
                            paramsArr.push(para.teamK);
                            paramsArr.push(para.startTime);
                            paramsArr.push(para.endTime);
                            paramsArr.push(para.diffBall);
                            paramsArr.push(para.createTime);
                            paramsArr.push(para.s);
                            paramsArr.push(para.p);
                            paramsArr.push(para.f);
                            paramsArr.push(para.rs);
                            paramsArr.push(para.rp);
                            paramsArr.push(para.rf);
                            db.query(sql, paramsArr);
                        }
                    }
                })
            }
        }
    }
};

module.exports = resultList;