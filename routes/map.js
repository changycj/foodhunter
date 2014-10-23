// Lead: Judy Chang
// set up Mongoose and load all Locations data

var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var location = require("../models/Location");
var User = require("../models/User").User;
var request = require("request");

// // set up mongo database
var connection_string = process.env.MONGOLAB_URI || "localhost:27017/foodhunter";
// var connection_string = "localhost:27017/foodhunter";
console.log("CONNECTION STRING: " + connection_string);
mongoose.connect(connection_string);
var db = mongoose.connection;

db.on("error", console.error.bind(console, "Mongoose connection error."));
db.once("open", function() {    
    // mongoose.connection.db.dropDatabase(function(err, result) {
    //     if (err) {
    //         console.error.bind(console, "Mongoose database error.");
    //     } else {
    //         insertLocation();
    //     }
    // });

    location.Location.count({}, function(err, count) {
        if (!err) {
            if (count == 0) {
                insertLocation();
            } else {
                setupRoutes();
            }
        }
    });
});

// store locations from MIT map api
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
                            
                            // dummy user for testing
                            var newUser = new User({
                                _id: "test",
                                events: [],
                                subscriptions: []
                            });

                            newUser.save(function(err, u) {
                                if (err) {
                                    console.log("Error creating dummy user. " + err);
                                } else {
                                    setupRoutes();
                                }
                            });
                        }
                    }
                });
            }


        }
    });
}

var setupRoutes = function() {
    
    router.get("/", function(req, res) {
        
        if (req.cookies.kerberos != undefined) {
            res.render("map", {
                kerberos: req.cookies.kerberos
            });
        } else {
            res.redirect("/login");
        }
    });
}


module.exports = router;