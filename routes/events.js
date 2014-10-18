var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
var Event = require('../models/Event').Event;

/* DISPLAY ALL EVENTS*/
router.get('/', function(req, res) {
	Event.find({},{}, function(err, doc){
	if (err){
		console.log("Error listing all the events");
	}
	else{
		//res.json(doc); //return all docs
		res.render('testevent', {title: "Test Mode", allEvents:doc});
	}
	});

});
/*CREATE A NEW EVENT*/
/*TODO: validate hours, date, status, error handling in general*/
router.post('/', function(req, res) {
	var status = "Food"; //default status
    var host = req.body.host;
    var startTimeHour = parseInt(req.body.startTimeHour);
    var startTimeMin = parseInt(req.body.startTimeMin);
    var startTime = startTimeHour+startTimeMin/60;
    var endTimeHour = startTimeHour+1; //by default the event is 1 hr long
    if (req.body.endTimeHour){
    	 endTimeHour= parseInt(req.body.endTimeHour);
    }
    var endTimeMin = startTimeMin;
    if (req.body.endTimeMin){
    	 endTimeMin= parseInt(req.body.endTimeMin);
    }
    var endTime = endTimeHour+endTimeMin/60;

    var date = new Date(req.body.date);
    var location = req.body.location;
    var description = req.body.description;
    if (description){ //description was included
    	var newEventJSON = {"host":host, 
    					"when": 
    							{"time":{"start":startTime, "end":endTime},
    							"date":date},
    					"location": location,
    					"status":status,
    					"description":description
    					};
    	}
    else{ //no description
    	var newEventJSON = {"host":host, 
    					"when": 
    							{"time":{"start":startTime, "end":endTime},
    							"date":date},
    					"location": location,
    					"status":status
    					}
    	}
    var newEvent = new Event(newEventJSON);
    newEvent.save(function(err){
    	if (err){
    		console.log("Error creating a new event instance");
    	}
    	else{
    		//res.json(newEvent);
    		//res.json({message:"event created"}); //smth...
    		res.redirect('/events');
    	}
    });
});
router.put('/:eventId', function(req,res){
	var eventId = req.params.eventId;
	var fieldToChange = req.body.fieldToChange; 
	// Possible values: "location", "date", "start", "end", "status", "description"
	var newValue = req.body.newValue;
	Event.findOne({_id:eventId}, function(err, doc){
		if (err){
			console.log("Error while updating the event");
			return;
		}
		else{
			if (fieldToChange==="date"){
				doc.when.date = newValue;
			}
			else if(fieldToChange==="location"){
				doc.location = newValue;
			}
			else if (fieldToChange==="start"){
				doc.when.time.start = newValue;
			}
			else if (fieldToChange==="end"){
				doc.when.time.end = newValue;
			}
			else if (fieldToChange==="status"){
				doc.status = newValue;
			}
			else if (fieldToChange==="description"){
				doc.description = newValue;
			}
			else{
				console.log("Error updating the event instance");
			}
		}
		doc.save(function(err){
			if (err){
				console.log("Error saving the updates");
				return;
			}
			res.redirect('/event/'+eventId);
			//res.json({message:"event updated"});
		})
	});
});

router.delete('/events/:eventId', function(req,res){
	var eventId = req.params.eventId;
	Events.remove({_id:eventId}, function(err){
		if (err){
			console.log("Error deleting event: "+ eventId);
		}
		else{
			//res.json({message:"event deleted"});
			res.redirect('/events');
		}
	});

});

module.exports = router;
