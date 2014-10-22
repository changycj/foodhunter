// Lead: Judy Chang
// testing Location API

// 1. test GET "/api/locations" to get ALL locations
// 2. test GET "/api/locations/:loc_id" to get ONE single location

$(document).ready(function() {
    
    $.ajax({
        url: "/api/locations",
        method: "GET",
        success: function(data) {
            testAllLocationsGet(data);

            // assume all successful
            // randomly takes the 150th entry (we know there are 253 entries)
            var dummy_loc = data.locations[150];
            console.log(dummy_loc);

            $.ajax({
                url: "/api/locations/" + dummy_loc._id,
                method: "GET",
                success: function(data) {
                    testOneLocationGet(data, dummy_loc);
                }
            });
        }

    });

    function testOneLocationGet(data, dummy_loc) {
        // test getting one
        test("testing getting one specific location - {building: " + dummy_loc.building + ", name: " + dummy_loc.name+ "}", function() {
            equal(data.statusCode, 200, "Data successfully returned");
            equal(data.location._id, dummy_loc._id, "_id's (" + dummy_loc._id + ") are equal.")
            equal(data.location.building, dummy_loc.building, "building's (" + dummy_loc.building + ") are equal.");
            equal(data.location.name, dummy_loc.name, "name's (" + dummy_loc.name + ") are equal.");
            equal((data.location.gps.lat == dummy_loc.gps.lat) && (data.location.gps.lon == dummy_loc.gps.lon), true, 
                "GPS [lat, lon]'s [" + dummy_loc.gps.lat + ", " + dummy_loc.gps.lon + "] are equal.");
        });
    }
    function testAllLocationsGet(data) {
        // test getting all 
        test("testing getting all locations", function() {
            equal(data.statusCode, 200, "Data successfully returned");
            equal(data.locations.length > 0, true, "Nonempty list of locations (" + data.locations.length + ") returned");
        });
    }
});