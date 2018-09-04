var schedule = require('node-schedule');
var dbManage = require('./dataManage');

var shceduleList = {
    tigger: function () {
        schedule.scheduleJob('*/1 * * * *', function () {
            dbManage.init();
        });
    }
};

module.exports = shceduleList;