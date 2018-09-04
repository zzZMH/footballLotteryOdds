var db = require('./dbConnect');
var format = require('./formatDate');
var seg = require('superagent');
var jq = require('cheerio');

var resultList = {
    init: function () {
        var params = {};
        var curTime = format.getFormatDate();
        var url = "http://caipiao.163.com/order/jczq-hunhe/?betDate=";
        seg.get(url).end(function (err, resp) {
            if (err) {
                return console.log(err);
            }
            var $ = jq.load(resp.text);
            //比赛列表
            var dataCont = $('.gameSelect').children().first().next().children().first();
            //日期
            var gameDate = dataCont.children().first().html().substring(0, 10);
            params.gameDate = gameDate;
            params.curTime = curTime;
            var param = [];
            //比赛详细信息
            dataCont.find("dd").each(function (index, item) {
                if (index % 2 === 0) {
                    var para = {};
                    para.gameNo = $(item).children(".co1").children("i").html();//比赛场次
                    $(item).children(".co4").children("a").children("em").each(function (idx, itm) {
                        if (idx === 1) {
                            para.teamNameK = $(itm).attr("title");
                        } else {
                            para.teamNameZ = $(itm).attr("title");
                        }
                    });//主/客队名称
                    var times = $(item).children('.co3').children('i').attr("inf").split("<br/>");
                    for(var i = 0;i < times.length;i++){
                        var tm = times[i].split("：");
                        if(i === 0){
                            var stopTimeStr = tm[1]+":00";
                            var stopTime = new Date(stopTimeStr.replace("-","/"));
                            var minute = stopTime.getMinutes();
                            stopTime.setMinutes(minute+3);
                            para.stopTime = format.getFormatDate(stopTime);
                        }else{
                            para.startTime = tm[1]+":00";
                        }
                    }//开始/截止时间
                    var gameRate = [];
                    for(var i = 1;i < 3;i++){
                        var rates = $(item).children('.co6_1').children('.line'+i).children("em");
                        var diffBall = $(rates[0]).html();
                        for(var j = 1;j < rates.length;j++){
                            var rate = {};
                            rate.diffBall = diffBall;
                            rate.spfType = $(rates[j]).attr("index");
                            rate.spfRate = $(rates[j]).html();
                            gameRate.push(rate);
                        }
                    }//赔率数据
                    para.gameRate = gameRate;
                    param.push(para);
                }
            });
            params.gameData = param;
            console.log(params);
        });
    },
    query: function (param, curDate) {

    },
    create: function (params) {
        var sqlStr1 = "select * from userInfo";
        var paramsArr1 = [];
        db.query(sqlStr1, paramsArr1);
        this.modify("asd");
    },
    modify: function (param) {
        console.log(param);
    }
};
module.exports = resultList;