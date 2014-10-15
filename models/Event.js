var mongoose = require("mongoose");

var eventSchema = mongoose.Schema({
    when: {
        time: {start: Number, end: Number},
        date: Date 
    },
    status: String,
    host: String,
    description: String,
    location: {type: mongoose.Schema.Types.ObjectId,
    		   ref : 'Location'
    }
});

var Event = mongoose.model("Event", eventSchema);

exports.Event = Event;