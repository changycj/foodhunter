// TODO:
// - user authentication
// - drawing markers (add all then filter) -> also add time/date slider on marker filter
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

    // load events to map
    $.ajax({

        url: "/api/events",
        method: "GET",
        success: function(data) {
            if (data.success == 1) {
                for (var i = 0; i < data.events.length; i++) {
                    var ev = data.events[i];
                    addMarker(ev);
                }

                // add marker helper function
                function addMarker(ev) {

                    var marker = L.mapbox.featureLayer({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [ev.location.gps.lon, ev.location.gps.lat]
                        },
                        properties: {
                            title: (ev.location.building == undefined ? "" : ev.location.building + " - ") + ev.location.name,
                            description: (new Date(ev.when.start)).toLocaleString() + "<br>" + ev.description,
                            "marker-size" : "small",
                            "marker-color" : "#BE9A6B",
                            "marker-symbol" : "ice-cream"
                        }
                    }).addTo(map);
                }
            } else {
                errorRedirect();
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
            if (data.success == 1) {
                var user = data.user;
                console.log(user);

                // load locations data
                $.ajax({
                    url: "/api/locations/?fields=name,building",
                    method: "GET",
                    success: function(data) {

                        if (data.success == 1) {

                            var locs = data.locations;

                            // populate location options
                            var select = $("select[class='location']");
                            $.each(locs, function(key, loc) {
                                $("<option/>").val(loc._id).text((loc.building == undefined ? "" : loc.building + ", ") + loc.name)
                                    .appendTo(select);                                
                            });

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

                            function addMySubscription(loc, time_block) {

                                var sub = $("<p/>").text(loc.text() + " from " + time_block.text() + " ")
                                    .insertBefore("#form_subscribe");

                                // $("#form_subscribe").before(
                                //     $("<p/>").text(loc.text() + " from " + time_block.text() + " ")
                                //         .append(btn));
                                var btn = $("<button/>").text("Delete").click(function(e) {
                                    var formData = {
                                        location: loc.val(),
                                        time_block: time_block.val()
                                    };
                                    $.ajax({
                                        url: "/api/subscriptions/subscribe",
                                        type: "DELETE",
                                        data: formData,
                                        success: function(data) {
                                            if (data.success == 1) {
                                                sub.remove();
                                            } else {
                                                errorRedirect();
                                            }
                                        },
                                        error: errorRedirect
                                    });
                                }).appendTo(sub);
                                                          
                            }
                        
                            function addMyEvent(ev) {
                                var item = $("<li/>").appendTo("#my_events_container ul");
                                $("<p/>").appendTo(item).text((new Date(ev.when.start)).toLocaleString());
                                $("<p>").appendTo(item).text(
                                    $("#form_subscribe select[name='location'] option[value='"+ ev.location + "']").text());
                                $("<p/>").appendTo(item).text(ev.description);
                                
                                var control = $("<p/>").appendTo(item);
                                
                                $("<button/>").text("View/Edit").appendTo(control).click(function(e) {
                                    window.open("/event_details?id=" + ev._id, "popup", "width=500px; height = 800px;")
                                });
                                
                                $("<button/>").text("Delete").appendTo(control).click(function(e) {
                                    $.ajax({
                                        url: "/api/events/" + ev._id,
                                        type: "DELETE",
                                        success: function(data) {
                                            if (data.success == 1) {
                                                item.remove();

                                                // must reload for map to correspond (FOR NOWWW)
                                                // will change in 3.3
                                                window.location.reload();
                                            } else {
                                                errorRedirect();
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
                                $("#form_add_event input[name^='date']").datepicker();

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
                                        url: "/api/events",
                                        type: "POST",
                                        data: formData,
                                        cache: false,
                                        success: function(data) {
                                            if (data.success== 1) {
                                                $("#form_add_event")[0].reset();
                                                addMyEvent(data.event);

                                                // must reload to show map marker (FOR NOWWWW)
                                                // will change in 3.3
                                                window.location.reload();

                                            } else {
                                                errorRedirect();
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
                                        url: "/api/subscriptions/subscribe",
                                        type: "POST",
                                        data: formData,
                                        success: function(data) {
                                            if (data.success == 1) {
                                                
                                                addMySubscription(location, time_block);

                                                // // reload to refresh content
                                                // // will change in 3.3
                                                // window.location.reload();

                                            } else {
                                                alert("ERROR!");
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
                errorRedirect();
            }

        },
        error: errorRedirect
    });

    // error handler
    function errorRedirect() {
        alert("ERROR!");
        window.location = "/";
    }
   

});