// ==UserScript==
// @name         Horriblesubs Time Zone Fix
// @version      1.3.1
// @description  Release time for your timezone
// @author       Cpt_Mathix & Hoshiburst
// @match        http://horriblesubs.info/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.1/moment.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.14/moment-timezone-with-data-2012-2022.min.js
// @license      GPL version 2 or any later version; http://www.gnu.org/licenses/gpl-2.0.txt
// @grant        none
// @noframes
// @namespace https://greasyfork.org/users/16080
// ==/UserScript==

// Thank you Hoshiburst (https://greasyfork.org/en/forum/profile/Hoshiburst) for helping me improve this script

Number.prototype.mod = function(n) {
    return (( this % n) + n) % n;
};

// Current day in LA and locally
var local_day = parseInt(moment().local().format('d'));

// Difference between local time and LA time
var difference = parseInt(moment().local().format('ZZ')) - parseInt(moment().tz('America/Los_Angeles').format('ZZ'));

// HS sidebar schedule
var sidebar = document.getElementById('sidebar');
if (sidebar !== null && difference !== 0)
    getFullSchedule(sidebar, difference);

// HS full release schedule
if (window.location.href.indexOf('schedule') > -1) {
    var el = document.getElementById('main');
    var daily_schedule = el.getElementsByTagName('table');
    for (var i = 0; i < 7; i++) {
        // i = 0 corresponds to the table for Monday so we add 1 and mod 7 for convertTime
        convertFullReleaseScheduleTime(daily_schedule[i], (i + 1).mod(7));
    }
}

configClock();

function configClock() {
    // go to https://www.timeanddate.com/clocks/free.html make your own clock and paste the src, width and height below
    var src = '';
    var width = '101'; // default
    var height = '20'; // default

    var schedule = document.getElementsByClassName('textwidget');
    if (schedule.length !== 0) {
        for(var i = 0; i < schedule.length; i++) {
            if (schedule[i].innerHTML.indexOf('timeanddate') > -1)
                schedule = schedule[i];
        }
        var timer = schedule.childNodes[0];
        if (src === '') {
            schedule.parentNode.style.display = 'none';
        } else {
            timer.src = src;
            timer.width = width;
            timer.height = height;
        }
    }
}

function getFullSchedule(element, difference) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var container = document.implementation.createHTMLDocument().documentElement;
            container.innerHTML = xmlHttp.responseText;
            createTodaysSchedule(container, element, difference);
        }
    };
    xmlHttp.open('GET', 'http://horriblesubs.info/release-schedule/', true); // true for asynchronous
    xmlHttp.send(null);
}

function createTodaysSchedule(schedule, element, difference) {
    schedule = schedule.querySelector('.entry-content');

    // Eg. If it's Monday in Sydney, difference is +18 so we want to
    // fill the sidebar with shows released on Sunday and Monday in NA
	var first_day, second_day;
    if (difference < 0) {
        first_day = local_day;
        second_day = (local_day + 1).mod(7);
    } else if (difference > 0) {
        first_day = (local_day - 1).mod(7);
        second_day = local_day;
    }

    var scheduleWeekdays = schedule.getElementsByClassName('schedule-today-table');
    var firstDaySchedule = scheduleWeekdays[(first_day - 1).mod(7)].firstElementChild.innerHTML.replace(/schedule-page-item/g, 'firstday').replace(/schedule-page-show/g, 'schedule-widget-show');
    var secondDaySchedule = scheduleWeekdays[(second_day - 1).mod(7)].firstElementChild.innerHTML.replace(/schedule-page-item/g, 'secondday').replace(/schedule-page-show/g, 'schedule-widget-show');

    var todaySchedule = element.querySelector('#text-16 > div > div > table > tbody');

    todaySchedule.innerHTML = firstDaySchedule + secondDaySchedule;

    for (var i = 0; i < todaySchedule.children.length; i++) {
        var anime = todaySchedule.children[i];
        if (anime.classList.contains('firstday')) {
            convertTodaysScheduleTime(anime, first_day);
        } else {
            convertTodaysScheduleTime(anime, second_day);
        }
    }
}

function convertTodaysScheduleTime(anime, day) {
    anime.innerHTML = anime.innerHTML.replace(/\d\d:\d\d/g, function(s) {
        var selected_time = moment.tz(day + ' ' + s, 'd HH:mm','America/Los_Angeles');
        var converted_time = selected_time.local();
        if (parseInt(converted_time.format('d')) !== local_day) {
            anime.style.display = 'none';
            return null;
        } else {
            return converted_time.format('HH:mm');
        }
    });
}

function convertFullReleaseScheduleTime(schedule, day) {
    schedule.innerHTML = schedule.innerHTML.replace(/\d\d:\d\d/g, function(s) {
        var selected_time = moment.tz(day + ' ' + s, 'd HH:mm','America/Los_Angeles');
        var converted_time = selected_time.local();
        return converted_time.format('ddd HH:mm');
    });
}
