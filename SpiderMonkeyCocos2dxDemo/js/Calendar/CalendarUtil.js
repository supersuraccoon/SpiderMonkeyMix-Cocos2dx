// CalendarUtil.js

// return days in a given month + year
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
};

// return the weekday of the first in a given month + year
function getFirstDay (month, year) {

    var dateObj =  new Date();
    dateObj.setFullYear(year);
    dateObj.setMonth(month - 1);
    dateObj.setDate(1);
    return dateObj.getDay();
};

// return a date string from give second
function stringFromTime(sec) {
    var d = new Date(sec * 1000);
    var date = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    return year + "-" + (month > 9 ? month : "0" + month ) + "-" + (date > 9 ? date : "0" + date ) + ""
};

// returns a date string of now
function nowStringDate() {
    return stringFromTime(new Date().getTime() / 1000);
};