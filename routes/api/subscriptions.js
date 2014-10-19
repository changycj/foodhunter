//var express = require("express");
//var router = express.Router();
//var location = require("../../models/Location");
//
//// REST API for location
//
//// GET find list of locations
//router.get("/", function(req, res) {
//    location.Location.find(req.query).sort({building: "asc"}).exec(function(err, locs) {
//        if (err) {
//            res.send("Error retrieving location info. " + err);
//        } else {
//            console.log(locs);
//            res.json(locs);
//        }
//    });
//});
//
//// GET specific location information
//router.get("/:id", function(req, res) {
//    var locId = req.params.id;
//
//    location.Location.find( {"_id" : locId} ).limit(1).exec(function(err, loc) {     
//        if (err) {
//            res.send("Error retrieving location info. " + err);
//        } else {
//            console.log(loc);
//            res.json(loc[0]);   
//        }
//    });
//});
//
//module.exports = router;