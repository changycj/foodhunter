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
                        var item = $("<div/>").appendTo("#events_list");
                        $("<p/>").appendTo(item).text(ev.location.name 
                            + " " + (new Date(ev.when.start)).toLocaleString() 
                            + " to "
                            + itemDate.toLocaleString()
                        );
                        $("<p/>").appendTo(item).text(ev.description);
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
   

});