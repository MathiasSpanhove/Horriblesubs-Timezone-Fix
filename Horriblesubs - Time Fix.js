// ==UserScript==
// @name         Horriblesubs Time Zone Fix
// @version      1.1.0
// @description  Release time for your timezone
// @author       Cpt_Mathix
// @match        http://horriblesubs.info/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.3.0/moment-timezone.min.js
// @grant        none
// @namespace https://greasyfork.org/users/16080
// ==/UserScript==

var currentTime = moment();
var utcTime = moment.utc();
moment.tz.add('America/Los_Angeles|PST PDT|80 70|0101|1Lzm0 1zb0 Op0');
var timeLA = moment.tz(currentTime, "America/Los_Angeles");
// difference between UTC and LA
var difference = utcTime.hours() - timeLA.hours();


var el1 = document.getElementById('sidebar');
if (el1 != null)
    init(el1);

if(window.location.href.indexOf("schedule") > -1) {
    var el2 = document.getElementById('main');
    if (el2 != null)
        init(el2);
}

// go to https://www.timeanddate.com/clocks/free.html make your own clock and paste the src below
var src = '';
var schedule = document.getElementsByClassName("textwidget");
if (schedule.length != 0) {
    for(var i = 0; i < schedule.length; i++) {
        if (schedule[i].innerHTML.indexOf('timeanddate') > -1)
            schedule = schedule[i];
    }
    var timer = schedule.childNodes[0];
    if (src == '') {
        schedule.parentNode.style.display = 'none';
    } else {
        timer.src = src;
        timer.width = '120';
        if (src.indexOf('cf100') > -1)
            timer.height = '120';
    }
}


function init(element) {     
    element.innerHTML = element.innerHTML.replace(/\d\d:\d\d/g, function(s) {    
        var mdy = s.split(':');
        var hour = Number(mdy[0]);
        var date = new Date();
        var hour = hour + difference - (date.getTimezoneOffset()/60);
        
        if (hour > 23) {
            var hour = hour - 24;
        }
        if (hour < 0) {
            var hour = hour + 24;
        }
        return hour + ':' + mdy[1];    
    });
}

