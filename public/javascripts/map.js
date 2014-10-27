// Lead: Judy Chang

// Main UI page with map

// TODO:
// - user authentication -- done
// - drawing markers (add all then filter) -> also add time/date slider on marker filter -- done
// - currently any update to events must refresh page to reflect on map (investigate in 3.3) - done

$(document).ready(function() {

    // user kerberos
    var kerberos = window.location.search.split("kerberos=")[1];

    var cookies = document.cookie.split(";");
    var login = "false";
    var user = "";
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split("=");
        if (cookie[0].trim() == "login") {
            login = cookie[1].trim();
        } else if (cookie[0].trim() == "kerberos") {
            user = cookie[1].trim();
        }
    }

    // user on cookie is same as the profile requested
    if (login == "true" && user == kerberos) {
        
        // add map to UI
        L.mapbox.accessToken = "pk.eyJ1IjoiZm9vZGh1bnRlcnMiLCJhIjoiR0laWjlaUSJ9.CtACBQ0c6_gH9I25-Jpj-Q";
        var map = L.mapbox.map("map", "foodhunters.jp343j89", {
                minZoom: 14, maxZoom: 18
            }).setView([42.3585, -71.0935], 14);    
        map.setMaxBounds(map.getBounds().pad(1.1));
        map.featureLayer.setGeoJSON([]);

        
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

                    for (var i = 0; i < data.events.length; i++) {
                        var ev = data.events[i];

                        // add to upcoming events

                        if (new Date(ev.when.end) >= Date.today()) {
                            var item = $('<li class = "list-group-item" id="'+ ev._id +'"/>').appendTo("#all_events ul");                        
                            item.html(formEventDisplay(ev));
                        }
                        addEventMarker(ev);
                    }
                

                    // slider initializes to zero, which is today
                    map.featureLayer.setFilter(function(f) {
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
                                                    alert("Subscription removed!");
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
                                                    
                                                    // also remove from upcoming events list
                                                    $("#all_events ul li[id='"+ev._id+"']").remove();

                                                    removeEventMarker(ev);
                                                    alert("Event deleted!");
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
                                            success: function(data) {
                                                if (data.statusCode== 200) {

                                                    // need to reload to refresh map
                                                    // window.location.reload();
                                                    addEventMarker(data.event);
                                                    alert("Event added!");

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
                                                    
                                                    alert("Subscription added!");
                                                    addMySubscription(location, time_block);

                                                } else if (data.statusCode == 409) {
                                                    alert("User already subscribes to this!");
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


        function addEventMarker(ev) {
            
            if (typeof ev.location == "string") {
                $.ajax({
                    url: "/api/locations/" + ev.location,
                    method: "GET",
                    success: function(data) {
                        if (data.statusCode == 200) {
                            ev.location = data.location;
                            addMarker();
                        } else {
                            errorRedirect(data.message);
                        }
                    },
                    error: errorRedirect
                });
            } else {
                addMarker();
            }

            function addMarker() {
                var events = map.featureLayer.getGeoJSON();

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
                        event_id: ev._id,
                        "marker-size" : "small",
                        "marker-color" : "#BE9A6B",
                        "marker-symbol" : "ice-cream"
                    }
                };
                events.push(geojson);
                map.featureLayer.setGeoJSON(events);
            }
        }

        function removeEventMarker(ev) {
            var event_id = ev._id;

            var geojson = map.featureLayer.getGeoJSON();

            for (var i = 0; i < geojson.length; i++) {
                if (geojson[i].properties.event_id == event_id) {
                    geojson.splice(i, 1);
                }
            }
            map.featureLayer.setGeoJSON(geojson);

            // map.refresh();
        }

    } else {
        window.location.reload("/");
    }

    // HELPER FUNCTIONS
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
    function formEventDisplay(ev){
        var time = "<b>When:</b> " + getTimeRangeString(new Date(ev.when.start), new Date(ev.when.end)) +'<br />';

        var loc_name = (typeof ev.location == "string") ? ($("#form_subscribe select[name='location'] option[value='" 
            + ev.location + "']").text()) : ev.location.name;

        var loc = "<b>Where: </b>"+ loc_name +'<br />';
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