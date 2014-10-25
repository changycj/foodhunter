// Lead: Rebekah Cha

// A newsfeed that displays upcoming events ordered by time

//TODO: real-time loading

$(document).ready(function() {

    // load events
    $.ajax({
        url: "/api/events",
        method: "GET",
        success: function(data) {
            if (data.statusCode == 200) {
                for (var i = 0; i < data.events.length; i++) {
                    var ev = data.events[i];
                    addEvent(ev);
                }        
                function addEvent(ev) {
                    var curDate = new Date();
                    var itemDate = new Date(ev.when.end);
                    if (itemDate >= curDate){
                        var item = $('<li class = "list-group-item"/>').appendTo("#all_events ul");
                        
                        item.html(formEventDisplay(ev));

                    }
                }
            } else {
                errorRedirect(data.message);
            }
        },
        error: errorRedirect
    });

    // error handler
    function errorRedirect(msg) {
        alert("ERROR! " + msg == undefined ? "" : msg);
        window.location = "/";
    }
    function getTimeRangeString(start, end) {
        var date = start.toString("MMM d");

        var start_time = start.toString("h") + (start.getMinutes() == 0 ? "" : start.toString(":mm"))
            + start.toString("t").toLowerCase();

        var end_time = end.toString("h") + (end.getMinutes() == 0 ? "" : end.toString(":mm"))
            + end.toString("t").toLowerCase();
        return date + ", " + start_time + "-" + end_time;
    }

    function formEventDisplay(ev){
        var time = "<b>When:</b> " + getTimeRangeString(new Date(ev.when.start), new Date(ev.when.end)) +'<br />';
        var loc = "<b>Where: </b>"+ ev.location.name+'<br />';
        var desc = "<b>Details:</b> " +ev.description+'<br />';
        return time+loc+desc;
    }
   

});