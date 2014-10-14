$(document).ready(function() {
    
    var po = org.polymaps;

    var map = po.map().container($("#map")[0]);
    
    map.center({lat: 42.3585, lon: -71.0935})
        .zoom(15)
        .zoomRange([15, 18])
        .extent([map.pointLocation({x: 0, y: 0}), map.pointLocation(map.size())])
        .add(po.interact());
    
    map.add(po.image()
        .url(po.url("http://api.tiles.mapbox.com/v4/foodhunters.jp343j89/{Z}/{X}/{Y}.png" 
                    + "?access_token=pk.eyJ1IjoiZm9vZGh1bnRlcnMiLCJhIjoiR0laWjlaUSJ9.CtACBQ0c6_gH9I25-Jpj-Q")
        .hosts(["a.", "b.", "c.", ""])));

});