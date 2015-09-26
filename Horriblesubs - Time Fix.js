// ==UserScript==
// @name         MyAnimeList(MAL) - Extra v2
// @version      1.1.4
// @description  Show anime info in your animelist
// @author       Cpt_mathix
// @match        *://myanimelist.net/animelist/*
// @license      GPL version 2 or any later version; http://www.gnu.org/licenses/gpl-2.0.txt
// @grant        none
// @namespace https://greasyfork.org/users/16080
// ==/UserScript==

init();

function init() {
    var table = document.getElementById("list_surround").children;
    for (var i = 0; i < table.length; i++) {
        var cell = table[i].getElementsByTagName('td');

        for (var j = 0; j < cell.length; j++) {  
            // Displays Anime Info
            var hasMore = cell[j].innerHTML.search('More');
            if (hasMore != -1) {
                var animetitle = cell[j].getElementsByClassName('animetitle')[0].innerText;

                // get animeid
                var a = cell[j].getElementsByTagName("a");
                var animeid = a[1].id.match(/\d/g).join("");

                // get table color type
                var tdtype = cell[j].className.match(/\d/g).join("");

                // replace onclick function with my own
                a[1].removeAttribute('onclick');
                a[1].addEventListener('click', displayTable(animetitle, animeid, tdtype) , true); 
            }

            // Not Yet Aired becomes transparant
            var found = cell[j].innerHTML.search('Not Yet Aired');
            if (found != -1) {
                cell[j].setAttribute('style', 'opacity:0.50 !important');
                // table[i].setAttribute('style', 'display:none !important');
            }
        }
    }
}

function requestCrossDomain( site, callback ) {
     
    // Take the provided url, and add it to a YQL query.
    var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + site + '"') + '&format=xml&callback=?';
     
    // Request that YSQL string, and run a callback function.
    $.getJSON( yql, function(data) { 
        if ( data.results[0] ) {
            // Strip out all script tags, for security reasons. 
            data = data.results[0].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

            // If the user passed a callback, and it
            // is a function, call it, and send through the data var.
            if ( typeof callback === 'function') {
                callback(data);
            }
        } else {
            alert("Atarashii API is down");
        }
    });    
}

// if this fails to function, look at getExpand(arg1, arg2) function on the myanimelist page
function displayTable(animetitle, animeid, tdtype) {
    return function () {
        var moreObject = $('#more'+animeid);
        var memberId = $('#listUserId').val();

        if (moreObject.css('display') == 'block') {		// Hide if loaded
            moreObject.hide();
            return false;
        } 

        if (moreObject.css('display') == 'none') {		// Show if date is already loaded
            moreObject.show();
        }

        $.post("/includes/ajax-no-auth.inc.php?t=6", {color:tdtype,id:animeid,memId:memberId,type:$('#listType').val()}, function(data) {
            moreObject.html(data.html).show();
            load_img_tags();

            // change info with info from Atarashii API
            var hiddendiv = "more" + animeid;
            var table = document.getElementById(hiddendiv).getElementsByClassName('td' + tdtype + ' borderRBL')[0];
            if (table != null) {
                table.innerHTML = "Fetching data from Atarashii API"
                var url = "api.atarashiiapp.com/2/anime/" + animeid;
                // get anime info from the Atarashi API
                requestCrossDomain(url, function(results) {
                    // remove html tags
                    results = results.replace(/\<body\>|\<\/body\>|\<\/em\>/g, "");
                    // parse results into readable format
                    results = JSON.parse(results);
                    table.innerHTML = displayAnimeInfo(results);
                });
            }
        }, "json");
    };
}

function getEntryTag(data, string) {
    var results = data[string];
    if (results == null)
        return "N/A"
    return results;
}

function displayAnimeInfo(data) {
    var englishTitle = getEntryTag(data, 'english');
    if (englishTitle == null) {
        englishTitle = getEntryTag(data, 'title');
    }
    
    var rank = getEntryTag(data, 'rank');
    var popularity = getEntryTag(data, 'popularity_rank');
    var episodes = getEntryTag(data, 'episodes');
    if (episodes == "0") {
        episodes = "unknown";                
    }
    
    var score = getEntryTag(data, 'members_score');
    var startDate = getEntryTag(data, 'start_date').replace(/\d\d\d\d-\d\d-\d\d/g, function(s) {    
        var dmy = s.split('-');    
        return dmy[2] + '/' + dmy[1] + '/' + dmy[0];    
    });
    
    var endDate = getEntryTag(data, 'end_date').replace(/\d\d\d\d-\d\d-\d\d/g, function(s) {    
        var dmy = s.split('-');    
        return dmy[2] + '/' + dmy[1] + '/' + dmy[0];    
    });
    if (endDate == "00/00/0000") {
        endDate = "unknown";
    }
    
    var status = getEntryTag(data, 'status');
    status = status.charAt(0).toUpperCase() + status.slice(1);
    var synopsis = getEntryTag(data, 'synopsis').replace(/&lt;\/em&gt;/g, "</em>");
    var image = getEntryTag(data, 'image_url');
    var genres = getEntryTag(data, 'genres');
    
    var strVar="";
    strVar += "<body>";
    strVar += "<table>";
    strVar += "  <tr>";
    strVar += "    <td rowspan=\"2\">" + "<img src=" + image + ">" + "<\/td>";
    strVar += "    <td valign=\"top\">" 
    strVar += "    <b>" + "English:  " + "<\/b>" + englishTitle + "<br>"
    strVar += "    <b>" + "Status:   " + "<\/b>" + status + "<br>";
    strVar += "    <b>" + "Episodes: " + "<\/b>" + episodes + "<br>";
    strVar += "    <b>" + "Score:    " + "<\/b>" + score + "<br>";
    strVar += "    <b>" + "Rank: " + "<\/b>" + rank + "<br>";
    strVar += "    <b>" + "Popularity: " + "<\/b>" + popularity + "<br>";
    strVar += "    <b>" + "Aired: " + "<\/b>" + startDate + " to " + endDate + "<br>";
    strVar += "    <\/td>";
    strVar += "    <td valign=\"top\" align=\"right\">" + genres + "<\/td>";   
    strVar += "  <\/tr>";
    strVar += "  <tr>";
    strVar += "    <td valign=\"top\" colspan=\"2\" width=\"100%\">" + synopsis + "<\/td>";
    strVar += "  <\/tr>";
    strVar += "<\/table>";
    strVar += "<\/body>";
        
    return strVar;
}