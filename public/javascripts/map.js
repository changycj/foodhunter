$(document).ready(function() {

    // add map to UI
    L.mapbox.accessToken = "pk.eyJ1IjoiZm9vZGh1bnRlcnMiLCJhIjoiR0laWjlaUSJ9.CtACBQ0c6_gH9I25-Jpj-Q";
    var map = L.mapbox.map("map", "foodhunters.jp343j89", {
            minZoom: 15, maxZoom: 18
        }).setView([42.3585, -71.0935], 15);
    
    map.setMaxBounds(map.getBounds());
    
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
                console.log(loc);
                $("<option/>").val(loc._id).text(loc.building + ", " + loc.name)
                    .appendTo(select);
            });
        }
    })
    
    // populate time block options
    
    
    $("#add_subscription").click(function(e) {
        $(".subscription").clone().appendTo($("#form_subscribe"));
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
            url: "/test_post", // this should be the URL to add event method
            type: "POST",
            data: formData,
            cache: false,
            success: function(data) {
                alert("Success! " + JSON.stringify(data));
            },
            error: function() {
                alert("ERROR!");
            }
        });
    });
    
    
});