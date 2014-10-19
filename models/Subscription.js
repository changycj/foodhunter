var mongoose = require("mongoose");

var subscriptionSchema = mongoose.Schema({
    building: {type: mongoose.Schema.Types.ObjectID,
        ref: 'Location'},
    time_block: Number,
    users: [{type: String, ref:'User'}]
});

var Subscription = mongoose.model("Subscription", subscriptionSchema);

exports.Subscription = Subscription;