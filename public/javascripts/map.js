// TODO:
// - user authentication
// - drawing markers (add all then filter) -> also add time/date slider on marker filter
// - update corresponding API methods for each form
// - what to do when form successfully returned (success functions)

$(document).ready(function() {

    // add map to UI
    L.mapbox.accessToken = "pk.eyJ1IjoiZm9vZGh1bnRlcnMiLCJhIjoiR0laWjlaUSJ9.CtACBQ0c6_gH9I25-Jpj-Q";
    var map = L.mapbox.map("map", "foodhunters.jp343j89", {
            minZoom: 15, maxZoom: 18
        }).setView([42.3585, -71.0935], 15);
    
    map.setMaxBounds(map.getBounds().pad(1.1));
    
    // set up other UI widgets
    $("#form_add_event input[name^='time']").timepicker({"scrollDefault" : "now"});
    $("#form_add_event input[name^='date']").datepicker();
    
    // populate location options
    $.ajax({
        url: "/locations",
        method: "GET",
        success: function(locs) {
            var select = $("select[class='location']");
            $.each(locs, function(key, loc) {
                $("<option/>").val(loc._id).text((loc.building == undefined ? "" : loc.building + ", ") + loc.name)
                    .appendTo(select);
                
// TODO: currently adds marker for every location
// should switch to for every event
                addMarker(loc);
                
            });
        }
    })
        
    // add more subscription fields
    $("#add_subscription").click(function(e) {
        e.preventDefault();
        $(".subscription:last").clone().insertAfter($(".subscription:last"));
    });
    
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
//            status: "food", // ????? what should this be
//            host: "changycj", // should get from req.cookies
            description: $("textarea[name='description']").val(),
            location: $("select[name='location'] option:selected").val() // should be objectID instead
        };
        
        $.ajax({
//            url: "/test_post", // this should be the URL to add event method
            url: "/events",
            type: "POST",
            data: formData,
            cache: false,
            success: function(data) {
                alert("Success! " + JSON.stringify(data)); // what to actually do here?
            },
            error: function() {
                alert("ERROR!");
            }
        });
    });
    
    // subscribe form
    $("#form_subscribe").submit(function(e) {
        e.preventDefault();
        
        var subscriptions = [];
        
        $(".subscription").each(function(i) {
            var building = $(this).find("select[name='loc'] option:selected").val();
            var time_block = $(this).find("select[name='time'] option:selected").val();
            subscriptions.push({
                building: building,
                time_block: time_block
            });
        });
        
        var formData = {
            // username: "changycj" // this should be from cookies
            subscriptions: subscriptions
        };
        
        $.ajax({
            url: "/test_post", // replace with corresponding method in API
            type: "POST",
            data: formData,
            cache: false,
            success: function(data) {
                alert("Success! " + JSON.stringify(data)); // what to actually do here?
            },
            error: function() {
                alert("ERROR!");
            }
        });
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