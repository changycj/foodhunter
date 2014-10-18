var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var location = require("../models/Location");
var request = require("request");

// set up mongo database
var connection_string = "localhost:27017/food_hunter";
mongoose.connect(connection_string);
var db = mongoose.connection;

db.on("error", console.error.bind(console, "Mongoose connection error."));
db.once("open", function() {
    insertLocation();
    /*
    mongoose.connection.db.dropDatabase(function(err, result) {
        if (err) {
            console.error.bind(console, "Mongoose database error.");
        } else {
            insertLocation();
        }
    });
    */
});

var insertLocation = function() {
    
    request("http://m.mit.edu/apis/maps/places", function(err, resp, body) {
        if (!err &&  resp.statusCode == 200) {
            
            var places = JSON.parse(body);
            var count = 0;
            
            for (var i = 0; i < places.length; i++) {                
                var place = places[i];
                var params = {
                    gps: {
                        lat: place.lat_wgs84,
                        lon: place.long_wgs84
                    },
                    building: place.bldgnum,
                    name: place.name
                };
                
                var loc = new location.Location(params);
                
                loc.save(function(err) {
                    if (err) {
                        console.log("Error saving Location. " + err);
                        console.log(params);
                    } else {
                        count++;
                        if (count == places.length) {
                            setupRoutes();
                        }
                    }
                });
            }
        }
    });
}

var setupRoutes = function() {
    
    router.get("/", function(req, res) {
        
        location.Location.find({}).sort({building: "desc"}).exec(function(err, locs) {
            res.render("map", {
                title: "Food Hunter",
                locs: locs
            });
        });
    });
}


module.exports = router;