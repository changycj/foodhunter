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
    
    // form submissions
    
    // add event form
    $("#form_add_event").submit(function() {        
        var date  = $("input[name='date']").datepicker("getDate");
        
        var time_start = $("input[name='time_start']").timepicker("getTime", date);
        var time_end = $("input[name='time_end']").timepicker("getTime", date);
        
        var formData = {
            when: {
                start: time_start.valueOf(),
                end: time_end.valueOf()
            },
            status: "food", // ????? what should this be
            host: "changycj", // should be current user
            description: $("textarea[name='description']").val(),
            location: "W20" // should be objectID instead
        };
        
        $.post("/test_post", formData, function(data) {console.log("hello");});
    });
    
    
});