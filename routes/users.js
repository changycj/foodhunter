var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
// var location = require("../models/Location");
var request = require("request");


// var setupRoutes = function() {
    
//     router.get("/", function(req, res) {
        
//         location.Location.find({}).sort({building: "desc"}).exec(function(err, locs) {
//             res.render("map", {
//                 title: "Food Hunter",
//                 locs: locs
//             });
//         });
//     });
// }
module.exports = router;