var compareDate = {
    diffDays: function (startDate, endDate) {
        var a = new Date(startDate.replace(/-/g, "/"));
        var b = new Date(endDate.replace(/-/g, "/"));
        var dif = a.getTime() - b.getTime();
        var day = dif / (1000 * 60 * 60 * 24);
        return day;
    }
}

module.exports = compareDate;