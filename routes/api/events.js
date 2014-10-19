// TODO: email sendout

var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
//get models
var Event = require('../../models/Event').Event;
var User = require("../../models/User").User;
var Location = require("../../models/Location").Location;

/*DISPLAY ALL EVENTS*/
/*Currently in the test mode. Might not be needed in the deployed version*/
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

router.post('/', function(req, res) {
	var status = "Food"; //default status
	var today = new Date().valueOf(); // date when the event is created
	//start getting info
    var host = req.cookies.kerberos; //kerberos, string!!!!
    var data = req.body;
    var start = data.when.start; //number
    var end = data.when.end;
    console.log("START: "+start);
    var location = data.location; //comes as objectId already :)
	var description = req.body.description;
	
	var newEventJSON = {"host":host, 
    					"when": {"start":start, "end":end},
    					"location": location, //now it's ObjectId
    					"status":status,
    					"description":description
    					};
	//check if the event is valid. If nonsense entered, it puts today's date  
    if (!eventValidityCheck(newEventJSON, today)){
    	res.json({message:0, element:newEventJSON, details : "Event happens in the past"});
    	return;
    }
    //all good, go on
    var newEvent = new Event(newEventJSON);
    newEvent.save(function(err){
    	if (err){
    		console.log("Error creating a new event instance");
    		res.json({message:0, details:"Error creating a new event instance"});
    	}
    	else{
    		User.findOne({_id:host}, function(err, user){
    			if (err){
    				console.log("Error adding an event to the User.events. "+err);
    				res.json({message:0, details:"Error adding an event to user"});
    			}
    			//SUCH USER EXISTS
    			else {
    				user.events.push(newEvent._id);
    				user.save(function(err){
    					if (err){
    						console.log("Error adding an event to the User.events 2");
    						res.json({message:0, details:"Error adding an event to the User.events 2"});
    					}
    					else{
    						//res.json(newEvent);
    						res.json({message:1, element: newEvent}); //smth...
    						//res.redirect('/events');
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
		res.json(doc); //just send a JSON object
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
			//res.send(doc);
			//res.redirect('/event/'+eventId);
			res.json({message:1, element: doc});
		});
	});
});

/*********DELETE an event*********/
//TODO: delete event from Users.events list - DONE, but needs to be tested
//
router.delete('/:eventId', function(req,res){
    console.log("HI");
	var eventId = req.params.eventId;
    console.log(eventId);
	Event.remove({_id:eventId}, function(err){
		if (err){
			console.log("Error deleting event: "+ eventId);
		}
		else{
			User.update({_id:req.cookies.kerberos}, {$pull:{events:eventId}}, function(err, doc){
				if (err){
					console.log("Error while deleting event from usr's list");
				}
				else{
					res.json({message:1, element: doc});
					//res.redirect('/events');
				}
			});
			
		}
	});

});

//**************HELPERS***************
//DESCRIPTION: check if a new event instance happens in the past;
//INPUT: event JSON and today's time value in milliseconds
//OUTPUT: true if event happends in the past day
function eventValidityCheck(event, today){
	var start = event.when.start;
	var end = event.when.end;
	return start>=today && end >=start;
}

module.exports = router;
