var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
var Event = require('../models/Event').Event;
var User = require("../models/User").User;

/*********DISPLAY ALL EVENTS*********/
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

/*********CREATE A NEW EVENT*********/

/*TODO: validate hours, date, status, error handling in general*/
//TODO: add event to Users.events list - DONE, but need to be tested
router.post('/', function(req, res) {
	var status = "Food"; //default status
    var host = req.body.host; //kerberos, string!!!!
    var startTimeHour = req.body.startTimeHour; //number
    var startTimeMin = req.body.startTimeMin;  //number
    var startTime = startTimeHour+startTimeMin/60; 
    var endTimeHour = startTimeHour+1; //by default the event is 1 hr long
    if (req.body.endTimeHour){
    	 endTimeHour= req.body.endTimeHour;//number
    }
    var endTimeMin = startTimeMin; 
    if (req.body.endTimeMin){
    	 endTimeMin= req.body.endTimeMin; //number
    }
    var endTime = endTimeHour+endTimeMin/60;

    var date = new Date(req.body.date);
    var location = req.body.location; //needs to be ObjectID

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
    					};
    	}
    var newEvent = new Event(newEventJSON);
    newEvent.save(function(err){
    	if (err){
    		console.log("Error creating a new event instance");
    	}
    	else{
    		User.findOne({kerberos:host}, function(err, user){
    			if (err){
    				console.log("Error adding an event to the User.events");
    			}
    			//IF SUCH USER EXISTS
    			else  if (user){
    				user.events.push(newEvent._id);
    				user.save(function(err){
    					if (err){
    						console.log("Error adding an event to the User.events 2");
    					}
    					else{
    						//res.json(newEvent);
    						//res.json({message:"event created"}); //smth...
    						res.redirect('/events');
    					}
    				});
    			}
    			//NO SUCH USER IN THE DATABASE YET
    			else{
    				var newUser = new User({"kerberos": host, "events": [newEvent._id]});
    				newUser.save(function(err){
    					if (err){
    						console.log("Error creating a new user instance");
    					}
    					else{
    						res.redirect('/events');
    					}
    				});
    			}
    		});
    	}
    });
});

/*********GET individual event info*********/
router.get('/:eventId', function(req,res){
	var eventId = req.params.eventId;
	Event.findById(eventId, function(err, doc){
		if (err){
			console.log("Error finding the event");
			return;
		}
		res.send(doc); //just send a JSON object
	});
});

/*********UPDATE current event*********/
//TODO: need to be tested
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
			res.send(doc);
			//res.redirect('/event/'+eventId);
			//res.json({message:"event updated"});
		});
	});
});

/*********DELETE an event*********/
//TODO: delete event from Users.events list - DONE, but needs to be tested
//
router.delete('/events/:eventId', function(req,res){
	var eventId = req.params.eventId;
	Events.remove({_id:eventId}, function(err){
		if (err){
			console.log("Error deleting event: "+ eventId);
		}
		else{
			User.update({kerberos:host}, {$pull:{events:eventId}}, function(err, doc){
				if (err){
					console.log("Error while deleting event from usr's list");
				}
				else{
					//res.json({message:"event deleted"});
					res.redirect('/events');				}
			});
			
		}
	});

});


module.exports = router;
