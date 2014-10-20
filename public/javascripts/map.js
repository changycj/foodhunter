// TODO:
// - user authentication
// - drawing markers (add all then filter) -> also add time/date slider on marker filter
// - update corresponding API methods for each form
// - what to do when form successfully returned (success functions)

$(document).ready(function() {

    var kerberos = window.location.search.split("kerberos=")[1];
    
    // add map to UI
    L.mapbox.accessToken = "pk.eyJ1IjoiZm9vZGh1bnRlcnMiLCJhIjoiR0laWjlaUSJ9.CtACBQ0c6_gH9I25-Jpj-Q";
    var map = L.mapbox.map("map", "foodhunters.jp343j89", {
            minZoom: 15, maxZoom: 18
        }).setView([42.3585, -71.0935], 15);
    
    map.setMaxBounds(map.getBounds().pad(1.1));
    
    // set up other UI widgets
    $("#form_add_event input[name^='time']").timepicker({"scrollDefault" : "now"});
    $("#form_add_event input[name^='date']").datepicker();

    // load user data
    $.ajax({
        url: "/api/users/" + kerberos,
        method: "GET",
        success: function(data) {
            if (data.success == 1) {
                var user = data.user;
                console.log(user);

                // enable forms                    
                enableForms();

                // populate user event data
                for (var i = 0; i < user.events.length; i++) {
                    addMyEvent(user.events[i]);
                }


                // load locations data
                $.ajax({
                    url: "/api/locations/?fields=name,building",
                    method: "GET",
                    success: function(data) {

                        if (data.success == 1) {
                            var locs = data.locations;
                            // enable adding more blank subscription fields
                            var select = $("select[class='location']");

                            $.each(locs, function(key, loc) {

                                // populate all locations options
                                $("<option/>").val(loc._id).text((loc.building == undefined ? "" : loc.building + ", ") + loc.name)
                                    .appendTo(select);
                                
                                // TODO: currently adds marker for every location
                                // should switch to for every event
                                // addMarker(loc);
                                
                            });

                            // populate subscription data
                            for (var i = 0; i < user.subscriptions.length; i++) {
                                // need to find actual building name and time_block representation
                                var time = user.subscriptions[i].time_block;
                                var time_string = $("#form_subscribe select[name='time'] option[value='" + time + "']").text();
                                var building = user.subscriptions[i].building;
                                var building_string = $("#form_subscribe select[name='location'] option[value='" + building + "']").text();
                                addMySubscription(building_string, time_string);
                            }

                        } else {
                            alert("ERROR!");
                            window.location = "/";
                        }
                    }
                }); 

                function enableForms() {
                    // add event form
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

                        $.ajax({
                            url: "/api/events",
                            type: "POST",
                            data: formData,
                            cache: false,
                            success: function(data) {
                                if (data.success== 1) {
                                    $("#form_add_event")[0].reset();
                                    addMyEvent(data.event);
                                    alert("Event created!");
                                } else {
                                    alert("Event create unsuccessful.");
                                }
                            },
                            error: function() {
                                alert("Error creating event!");
                            }
                        });
                    });

                    // TODOOOOO
                    // subscribe form
                    $("#form_subscribe").submit(function(e) {
                        e.preventDefault();
                        var that = this;
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
                                    console.log(data);
                                    addMySubscription(location.text(), time_block.text());
                                } else {
                                    alert("ERROR!");
                                }
                            }
                        });
                    });
                }

                function addMySubscription(loc, time_block) {
                    var btn = $("<button/>").text("Delete").click(function(e) {
                        console.log("DELETE SUBSCIPRIONT!!!");
                        // $.ajax({
                        //     url: "/test_post",
                        //     type: "DELETE",
                        //     data: formData

                        // });
                    });
                    $("#form_subscribe").before(
                        $("<p/>").text(loc + " from " + time_block + " ")
                            .append(btn));

                }
            
                function addMyEvent(ev) {
                    var item = $("<li/>").appendTo("#my_events_container ul");
                    $("<p/>").appendTo(item).text((new Date(ev.when.start)).toLocaleString());
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
                                    alert("Event deleted!");
                                } else {
                                    alert("Event delete unsuccessful.");
                                }
                            },
                            error: function(err) {
                                alert("Error deleting event.");
                            }
                        });
                    });
                }
            } else {
                alert("ERROR!");
            }

        }
    });
   
    
    function addMarker(loc) {
        // and also add markers to map
        var marker = L.mapbox.featureLayer({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [loc.gps.lon, loc.gps.lat]
            },
            properties: {
                title: loc.building,
                description: loc.name,
                "marker-size" : "small",
                "marker-color" : "#BE9A6B",
                "marker-symbol" : "ice-cream"
            }
        }).addTo(map);
    }
});