var mongoose = require("mongoose");

var subscriptionSchema = mongoose.Schema({
    building: {type: mongoose.Schema.Types.ObjectID,
        ref: 'Location'},
    time: {start, end},
    users: []
});

var Subscription = mongoose.model("Subscription", subscriptionSchema);

exports.Subscription = Subscription;