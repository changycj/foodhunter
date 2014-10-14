var mongoose = require("mongoose");

var locationSchema = mongoose.Schema({
    gps: {
        lat: {type: Number, required: true},
        lon: {type: Number, required: true} 
    },
    building: {type: String },
    name: {type: String }
});

var Location = mongoose.model("Location", locationSchema);

exports.Location = Location;