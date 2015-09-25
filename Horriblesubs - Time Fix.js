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

// hide timer
var schedule = document.getElementsByClassName("textwidget");
schedule[2].childNodes[0].style.display = 'none';
/* change timer
var timer = schedule[2].childNodes;
timer[0].src = 'http://free.timeanddate.com/clock/i4twj1ad/n48/tlbe14/th1/ta1';
timer[0].width = '100';
*/


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

