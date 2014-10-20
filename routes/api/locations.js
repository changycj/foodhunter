var express = require("express");
var router = express.Router();
var location = require("../../models/Location");

// REST API for location

// 1. GET find list of locations, can select fields via query string
//    e.g. "locations/?fields=name,building" -> returns all locations but with only name, building fields
// 2. GET specific Location object, query via ID
//    e.g. "locations/1234" -> return Location with ID 1234


// GET find list of locations
router.get("/", function(req, res) {

    var fields = (req.query.fields != undefined) ? req.query.fields.replace(",", " ") : {};
    
    location.Location.find({}, fields).sort({building: "asc"}).exec(function(err, locs) {
        if (err) {
            res.send("Error retrieving location info. " + err);
        } else {
            res.json(locs);
        }
    });
});

// GET specific location information
router.get("/:id", function(req, res) {
    var locId = req.params.id;

    location.Location.find( {"_id" : locId} ).limit(1).exec(function(err, loc) {     
        if (err) {
            res.send("Error retrieving location info. " + err);
        } else {
            res.json(loc[0]);   
        }
    });
});

module.exports = router;