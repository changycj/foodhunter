var mongoose = require("mongoose");

var locationSchema = mongoose.Schema({
    gps: {
        lat: {type: Number, required: true},
        lon: {type: Number, required: true} 
    },
    building: {type: String, required: true }
});

var Location = mongoose.model("Location", locationSchema);

exports.Location = Location;