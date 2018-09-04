var format = {
    getFormatDate: function (date) {
        if(!date && !(date instanceof Date)){
            date = new Date();
        }
        var seperator11 = "-";
        var seperator12 = ":";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();

        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (day >= 0 && day <= 9) {
            day = "0" + day;
        }
        if (hour >= 0 && hour <= 9) {
            hour = "0" + hour;
        }
        if (minute >= 0 && minute <= 9) {
            minute = "0" + minute;
        }
        if (second >= 0 && second <= 9) {
            second = "0" + second;
        }
        var currentdate = year + seperator11 + month + seperator11 + day + " " + hour + seperator12 + minute + seperator12 + second;
        return currentdate;
    }
}

module.exports = format;