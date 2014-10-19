var mongoose = require("mongoose");

var eventSchema = mongoose.Schema({
    when: {start: Number, end: Number},
    status: String,
    host: String,
    description: String,
    location: {type: mongoose.Schema.Types.ObjectId,
           ref : 'Location'
    }
});

var Event = mongoose.model("Event", eventSchema);

module.exports = {Event:Event};
/*var mongoose = require("mongoose");

var eventSchema = mongoose.Schema({
    when: {
        time: {start: {type: Number,
                       required: true, 
                       validate: [function(v){return v>=0 && v <=24}, 'start time must be btw 0 and 24']}, 
               end: {type: Number, 
                       validate: [function(v){return v>=0 && v <=24}, 'end time must be btw 0 and 24']}
              },
        
        date: {type: Date,
               required: true}
           },
    
    status:  {type: String,
              validate: [function(v){return v ==='Food' || v === 'No food'}, 'illegal event status'],
              required: true},
    
    host: {type: String,
           required: true},
    
    description: {type: String},
    
    location: {type: mongoose.Schema.Types.ObjectId,
               required: true,
    		   ref : 'Location'}
});

var Event = mongoose.model("Event", eventSchema);

exports.Event = Event;
*/