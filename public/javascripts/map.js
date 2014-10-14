$(document).ready(function() {

    L.mapbox.accessToken = "pk.eyJ1IjoiZm9vZGh1bnRlcnMiLCJhIjoiR0laWjlaUSJ9.CtACBQ0c6_gH9I25-Jpj-Q";
    
    var map = L.mapbox.map("map", "foodhunters.jp343j89")
        .setView([42.3585, -71.0935], 15);

});