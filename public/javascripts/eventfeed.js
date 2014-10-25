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

                        //var item = $("<div id='event_item'/>").appendTo("#events_list");
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
    function dateParser(date){
        var stringTime = new Date(date).toLocaleTimeString();
        var stringDate = new Date(date).toLocaleDateString();
        var splitTimeList = stringTime.split(" ");//time + pm/am
        var time = splitTimeList[0];
        var detail = splitTimeList[1];
        var length  = time.length;
        return  time.substring(0, length-3)+" "+detail+" on "+stringDate;
    }
    function formEventDisplay(ev){
        var time = "<b>When:</b> " + dateParser(ev.when.start)+'<br />';
        var loc = "<b>Where: </b>"+ $("#form_subscribe select[name='location'] option[value='"+ ev.location + "']").text()+'<br />';
        var desc = "<b>Details:</b> " +ev.description+'<br />';
        return time+loc+desc;
    }
   

});