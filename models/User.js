var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
	events: [{type: mongoose.Schema.Types.ObjectID, ref: 'Event'}],
	subscriptions: [{type: mongoose.Schema.Types.ObjectID, ref: 'Subscription'}]
});

var User = mongoose.model("User", userSchema);

exports.User = User;