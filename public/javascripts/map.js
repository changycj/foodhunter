// Lead: Judy Chang

// Main UI page with map

// TODO:
// - user authentication -- done
// - drawing markers (add all then filter) -> also add time/date slider on marker filter -- done
// - currently any update to events must refresh page to reflect on map (investigate in 3.3)

$(document).ready(function() {


    // user kerberos
    var kerberos = window.location.search.split("kerberos=")[1];
    
    // add map to UI
    L.mapbox.accessToken = "pk.eyJ1IjoiZm9vZGh1bnRlcnMiLCJhIjoiR0laWjlaUSJ9.CtACBQ0c6_gH9I25-Jpj-Q";
    var map = L.mapbox.map("map", "foodhunters.jp343j89", {
            minZoom: 14, maxZoom: 18
        }).setView([42.3585, -71.0935], 14);    
    map.setMaxBounds(map.getBounds().pad(1.1));

    
    // add date slider onto map
    $("#map_slider").labeledslider({
        min: -5, max: 21, value: 0, tickArray: makeArray(-5, 22), tickLabels: makeDateArray(-5,22),
        slide: function(e, s) {
            var chosen_date = new Date().addDays(s.value).clearTime();
            map.featureLayer.setFilter(function(f) {
                var event_date = new Date(f.properties.date).clearTime();
                return event_date.equals(chosen_date);
            });
        }
    });
    

    // load events to map
    $.ajax({

        url: "/api/events",
        method: "GET",
        success: function(data) {
            if (data.statusCode == 200) {
                var geojson_events = [];

                for (var i = 0; i < data.events.length; i++) {
                    var ev = data.events[i];

                    var title = (ev.location.building == undefined ? "" : ev.location.building + " - ")
                        + ev.location.name;
                    var description = 
                        getTimeRangeString(new Date(ev.when.start), new Date(ev.when.end)) + "<br>"
                        + "<i>" + ev.description + "</i><br>"
                        + "Host: " + ev.host;

                    var geojson = {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [ev.location.gps.lon, ev.location.gps.lat]
                        },
                        properties: {
                            title: title,
                            description: description,
                            date: ev.when.start,
                            "marker-size" : "small",
                            "marker-color" : "#BE9A6B",
                            "marker-symbol" : "ice-cream"
                        }
                    };

                    geojson_events.push(geojson);
                }

                // slider initializes to zero, which is today
                map.featureLayer.setGeoJSON(geojson_events).setFilter(function(f) {
                    return Date.today().equals(new Date(f.properties.date).clearTime());
                });

            } else {
                errorRedirect(data.message);
            }
        },
        error: errorRedirect
    });

    // load user data for interaction
    $.ajax({
        url: "/api/users/" + kerberos,
        method: "GET",
        success: function(data) {
            // if user data retrieved
            if (data.statusCode == 200) {
                var user = data.user;
                console.log(user);

                // load locations data
                $.ajax({
                    url: "/api/locations/?fields=name,building",
                    method: "GET",
                    success: function(data) {

                        if (data.statusCode == 200) {

                            var locs = data.locations;

                            // populate location options
                            var select = $("select[class='location']");
                            $.each(locs, function(key, loc) {
                                $("<option/>").val(loc._id).text((loc.building == undefined ? "" : loc.building + ", ") + loc.name)
                                    .appendTo(select);                                
                            });
                            select.addClass("form-control");

                            // populate my subscription data
                            for (var i = 0; i < user.subscriptions.length; i++) {
                                // need to find actual building name and time_block representation
                                var time = user.subscriptions[i].time_block;
                                var time_string = $("#form_subscribe select[name='time'] option[value='" + time + "']");
                                var building = user.subscriptions[i].building;
                                var building_string = $("#form_subscribe select[name='location'] option[value='" + building + "']");

                                addMySubscription(building_string, time_string);
                            }

                            // populate my events data
                            for (var i = 0; i < user.events.length; i++) {
                                addMyEvent(user.events[i]);
                            }

                            // bind form submissions handles
                            enableForms();

                            // HELPER FUNCTIONS
                            function addMySubscription(loc, time_block) {

                                var sub = $('<li class = "list-group-item"/>').appendTo("#my_subs_container");
                                sub.html(formSubDisplay(loc.text(), time_block.text()));

                                // $("#form_subscribe").before(
                                //     $("<p/>").text(loc.text() + " from " + time_block.text() + " ")
                                //         .append(btn));
                                var btn = $('<button class = "btn btn-default btn-sm"/>').text("Delete").click(function(e) {
                                    var formData = {
                                        location: loc.val(),
                                        time_block: time_block.val()
                                    };
                                    $.ajax({
                                        url: "/api/subscriptions/subscribe/user/"+kerberos,
                                        type: "DELETE",
                                        data: formData,
                                        success: function(data) {
                                            if (data.statusCode == 200) {
                                                sub.remove();
                                            } else {
                                                errorRedirect(data.message);
                                            }
                                        },
                                        error: errorRedirect
                                    });
                                }).appendTo(sub);
                                                          
                            }
                        
                            function addMyEvent(ev) {
                                var item = $('<li class = "list-group-item"/>').appendTo("#my_events_container ul");
                                item.html(formEventDisplay(ev));
                                
                                
                                var control = $("<p/>").appendTo(item);
                                
                                $('<button class = "btn btn-default btn-sm"/>').text("View/Edit").appendTo(control).click(function(e) {
                                    window.open("/event_details?id=" + ev._id + "&kerberos=" + kerberos,
                                     "popup", "width=500px; height = 800px;")
                                });
                                
                                $('<button class = "btn btn-default btn-sm"/>').text("Delete").appendTo(control).click(function(e) {
                                    $.ajax({
                                        url: "/api/events/" + ev._id + "/user/" + kerberos,
                                        type: "DELETE",
                                        success: function(data) {
                                            if (data.statusCode == 200) {
                                                item.remove();

                                                // must reload for map to correspond (FOR NOWWW)
                                                // will change in 3.3
                                                window.location.reload();
                                            } else {
                                                errorRedirect(data.message);
                                            }
                                        },
                                        error: function(err) {
                                            errorRedirect();
                                        }
                                    });
                                });
                            }

                            function enableForms() {

                                // set up other UI widgets
                                $("#form_add_event input[name^='time']").timepicker({"scrollDefault" : "now"});
                                $("#form_add_event input[name^='date']").datepicker({"minDate" : new Date()});

                                // ADD EVENT FORM
                                $("#form_add_event").submit(function(e) {        

                                    e.preventDefault();

                                    // should check for empty

                                    var date  = $("input[name='date']").datepicker("getDate");
                                    var time_start = $("input[name='time_start']").timepicker("getTime", date);
                                    var time_end = $("input[name='time_end']").timepicker("getTime", date);

                                    var formData = {
                                        when: {
                                            start: time_start.valueOf(),
                                            end: time_end.valueOf()
                                        },
                                        description: $("textarea[name='description']").val(),
                                        location: $("select[name='location'] option:selected").val() // should be objectID instead
                                    };

                                    // send data to back-end
                                    $.ajax({
                                        url: "/api/events/user/" + kerberos,
                                        type: "POST",
                                        data: formData,
                                        cache: false,
                                        success: function(data) {
                                            if (data.statusCode== 200) {
                                                $("#form_add_event")[0].reset();
                                                addMyEvent(data.event);

                                                // must reload to show map marker (FOR NOWWWW)
                                                // will change in 3.3
                                                window.location.reload();

                                            } else {
                                                errorRedirect(data.message);
                                            }
                                        },
                                        error: errorRedirect
                                    });
                                });

                                // SUBSCRIPTION FORM
                                $("#form_subscribe").submit(function(e) {
                                    e.preventDefault();

                                    var location = $(this).find("select[name='location'] option:selected");
                                    var time_block = $(this).find("select[name='time'] option:selected");

                                    var formData = {
                                        location: location.val(),
                                        time_block: time_block.val()
                                    };

                                    $.ajax({
                                        url: "/api/subscriptions/subscribe/user/" + kerberos,
                                        type: "POST",
                                        data: formData,
                                        success: function(data) {
                                            if (data.statusCode == 200) {
                                                
                                                addMySubscription(location, time_block);

                                                // // reload to refresh content
                                                // // will change in 3.3
                                                // window.location.reload();

                                            } else {
                                                errorRedirect(data.message);
                                            }
                                        },
                                        error: errorRedirect
                                    });
                                });
                            }

                        } else {
                            errorRedirect();
                        }
                    },
                    error: errorRedirect
                }); 
            } else {
                errorRedirect(data.message);
            }

        },
        error: errorRedirect
    });

    function getTimeRangeString(start, end) {
        var date = start.toString("MMM d");

        var start_time = start.toString("h") + (start.getMinutes() == 0 ? "" : start.toString(":mm"))
            + start.toString("t").toLowerCase();

        var end_time = end.toString("h") + (end.getMinutes() == 0 ? "" : end.toString(":mm"))
            + end.toString("t").toLowerCase();
        return date + ", " + start_time + "-" + end_time;
    }

    // error handler
    function errorRedirect(msg) {
        alert("ERROR! " + msg == undefined ? "" : msg);
        window.location = "/";
    }

    // function dateParser(date){
    //     var stringTime = new Date(date).toLocaleTimeString();
    //     var stringDate = new Date(date).toLocaleDateString();
    //     var splitTimeList = stringTime.split(" ");//time + pm/am
    //     var time = splitTimeList[0];
    //     var detail = splitTimeList[1];
    //     var length  = time.length;
    //     return  time.substring(0, length-3)+" "+detail+" on "+stringDate;
    // }
    function formEventDisplay(ev){
        var time = "<b>When:</b> " + getTimeRangeString(new Date(ev.when.start), new Date(ev.when.end)) +'<br />';
        var loc = "<b>Where: </b>"+ $("#form_subscribe select[name='location'] option[value='"+ ev.location + "']").text()+'<br />';
        var desc = "<b>Details:</b> " +ev.description+'<br />';
        return time+loc+desc;
    }
    function formSubDisplay(loc, time_block){
        var locDisplay = "<b>Building: </b>"+loc+'<br />';
        var time_blockDisplay = "<b>At times: </b>"+time_block+'<br />';
        return locDisplay+time_blockDisplay;
    }
    function makeArray(start, end){
        var ar = [];
        for (var i = start; i< end; i++){
            if (i%2==0){
                ar.push(i);
            }
        }
        return ar;
    }
    function makeDateArray(start, end){

        var ar = {};
        for (var i = start; i< end; i++){
            if (i==0){
                ar[i] = "Today";
            }
            else{
                ar[i] = (new Date()).addDays(i).toString("MMM d");
            }
        }
        return ar;
    }
   

});