var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
//     gps: {
//         lat: {type: Number, required: true},
//         lon: {type: Number, required: true} 
//     },
//     building: {type: String },
//     name: {type: String }
// });
	events: [{type: mongoose.Schema.Types.ObjectID, ref: 'Event'}],
	subscriptions: [{type: mongoose.Schema.Types.ObjectID, ref: 'Subscription'}]
});

var Location = mongoose.model("Location", locationSchema);

exports.Location = Location;