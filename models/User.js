var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
	kerberos: String,
	events: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
	subscriptions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Subscription'}]
});

var User = mongoose.model("User", userSchema);

exports.User = User;