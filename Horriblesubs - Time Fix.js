// ==UserScript==
// @name         Horrible Subs Time Zone Fix
// @version      1.0.0
// @description  Release time for your timezone
// @author       Cpt_Mathix
// @match        *://horriblesubs.info/*
// @grant        none
// ==/UserScript==

var el1 = document.getElementById('sidebar');
init(el1);

if(window.location.href.indexOf("schedule") > -1) {
    var el2 = document.getElementById('main');
    init(el2);
}

// go to https://www.timeanddate.com/clocks/free.html make your own clock and paste the src below (delete hide timer above)
var src = '';
var schedule = document.getElementsByClassName("textwidget");
if (src == '') {
    schedule[2].childNodes[0].style.display = 'none';
} else {
    var timer = schedule[2].childNodes;
    timer[0].src = src;
    timer[0].width = '100';
}

function init(element) {     
    element.innerHTML = element.innerHTML.replace(/\d\d:\d\d/g, function(s) {    
        var mdy = s.split(':');
        var hour = Number(mdy[0]);
        var date = new Date();
        var hour = hour + 7 - (date.getTimezoneOffset()/60);
        if (hour > 23) {
            var hour = hour - 24;
        }
        if (hour < 0) {
            var hour = hour + 24;
        }
        return hour + ':' + mdy[1];    
    });
}

