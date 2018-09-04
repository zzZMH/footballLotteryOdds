var express = require('express');
var router = express.Router();
var seg = require('superagent');
var jq = require('cheerio');

router.get('/', function (req, res, next) {
    var constUrl = "http://caipiao.163.com/order/jczq-hunhe/?betDate=";
    seg.get(constUrl).end(function (err, resp) {
        if (err) {
            return console.log(err);
        }
        var $ = jq.load(resp.text);
        var itemStr = "";
        //比赛列表
        $('.gameSelect').children().first().next().children().each(function (indexs, items) {
            var dataCont = $(items);
            var dataDate = "比赛日期：" + dataCont.children().first().html().substring(0, 10) + "<br/>";
            //比赛详细信息
            dataCont.find("dd").each(function (index, item) {
                if (index % 2 === 0) {
                    if ($(item).css("display") !== "none") {
                        itemStr += "比赛场次：" + $(item).children(".co1").children("i").html() + "<br/>";//比赛场次：001
                        $(item).children(".co4").children("a").children("em").each(function (idx, itm) {
                            if (idx === 1) {
                                itemStr += $(itm).attr("title") + "<br/>";
                            } else {
                                itemStr += $(itm).attr("title") + "vs";
                            }
                        });//AAA vs BBB
                        itemStr += $(item).children('.co3').children('i').attr("inf") + "<br/>";//截止时间：2018-09-03 23:57  开赛时间：2018-09-04 02:30
                        $(item).children('.co6_1').children('.line1').children("em").each(function (x, m) {
                            if (x === 0) {
                                itemStr += "让&#8194;" + $(m).html() + "球：";
                            } else if (x === 1) {
                                itemStr += "胜(" + $(m).html() + ") / ";
                            } else if (x === 2) {
                                itemStr += "平(" + $(m).html() + ") / ";
                            } else if (x === 3) {
                                itemStr += "负(" + $(m).html() + ")<br/>";
                            }
                        });
                        $(item).children('.co6_1').children('.line2').children("em").each(function (x, m) {
                            if (x === 0) {
                                itemStr += "让" + $(m).html() + "球：";
                            } else if (x === 1) {
                                itemStr += "胜(" + $(m).html() + ") / ";
                            } else if (x === 2) {
                                itemStr += "平(" + $(m).html() + ") / ";
                            } else if (x === 3) {
                                itemStr += "负(" + $(m).html() + ")<br/>";
                            }
                        });
                        itemStr += "<br/>";
                    }
                }
            });
        });
        //日期

        res.json({data: itemStr});
    });
});

module.exports = router;