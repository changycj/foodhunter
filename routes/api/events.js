// Lead: Dana Mukusheva
// Events API

var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
var Event = require('../../models/Event').Event;
var User = require("../../models/User").User;
var Location = require("../../models/Location").Location;
var Subscription = require("../../models/Subscription").Subscription;


/**********HELPERS FOR EMAILING*********/
/*
DESCRIPTION: finds the subscriptions related to the event
			 and returns a list of users signed up for that subscription.
PARAMS: event
RETURNS: list of users
*/
var findSubscribers = function(req, res, newEvent){
	var subscribers = [];

	Location.findOne({"_id": newEvent.location}).exec(function(err, loc){
		if (err){
			console.log("Error finding location of event");
		} else {
			var times = [];
			var building = loc;

            var time_block = Math.floor((new Date(newEvent.when.start).getHours() - 4) / 6);

			Subscription.find({"building": building, "time_block": time_block})
			.populate('users')
			.exec(function(e, subs){
				if (e) {
					//console.log("Error finding subscriptions from new event");
					res.json({success:0, details: "Error finding subscriptions from new event"});
				} else {
					for (var i = 0; i < subs.length; i ++){
						for (var subscribedUser = 0; subscribedUser < subs[i].users.length; subscribedUser ++){
							var email = subs[i].users[subscribedUser]._id + "@mit.edu";
							if (subscribers.indexOf(email) == -1){
								subscribers.push(email);
								// console.log("for now subscribers", subscribers);
							}
						}
					}
					emailOut(subscribers, newEvent, loc);
					res.json({success:1, event: newEvent});
				}
			});
		}
	});
}

/*
DESCRIPTION: emails out to the list of subscribed users.
			 Called when a new event is added.
PARAMS: subscribers is a list of users
RETURNS: nothing
*/
var emailOut = function(subscribers, newEvent, loc){

        // offset by 4 hours to get local time

	 	var eventStart = new Date(newEvent.when.start - 4 * 1000 * 60 * 60);
	 	var eventEnd = new Date(newEvent.when.end - 4 * 1000 * 60 * 60);

        var sendgrid = require("sendgrid")(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

        for (var i = 0; i < subscribers.length; i++) {

            var user = subscribers[i];
            var mailOptions = {
                to: user,
                from: "app30875858@heroku.com",
                subject: 'Free Food at ' + eventStart.getLocaleString() + ' in ' + loc.name,

                text: 'Date: ' + eventStart.getLocaleDateString() + "\n" + 
                    'Time: ' + eventStart.getLocaleTimeString() + " to " + eventEnd.getLocaleTimeString() + '\n'
                       + 'Description: ' + newEvent.description + '\n'
                       + 'Hosted by: '+ newEvent.host
                    +'\n\n You are receiving this because you (or someone else) has subscribed to the free food mailing list for '
                    + newEvent.location.name + '.\n'
            };

            sendgrid.send(mailOptions, function(err, json) {
                if (err) { return console.error(err);}
                console.log(json);
            });
        }
};

/********** REST API for event **********/

/* 
URL: /events
1. method: GET, description: retrieves the list of all available events
   response: report success/failure, send list of all events

2. method: POST, description: creates new event instance
   response: report success/failure, send a new event

URL: /events/:eventId
1. method: GET, description: retrieves individual event info
   response: report success/failure, send an existing event

2. method: PUT, description: updates existing event
   response: report success/failure, send an updated event

3. method: DELETE, description: deletes existing event
   response: report success/failure
*/


/**********GET ALL EVENTS**********/
/* Note:
Currently in the test mode. 
Might not be needed in the deployed version
*/
router.get('/', function(req, res) {
    Event.find({}).populate("location").exec(function(err, events){
        if (err){
            res.json({success:0});
        }
        else{
            res.json({success:1, events: events}); //return all docs
        }
    });
});

/**********CREATE A NEW EVENT**********/
router.post('/', function(req, res) {
	var status = "Food"; //default status
	var today = new Date().valueOf(); // date when the event is created
	//start getting info
    var host = req.cookies.kerberos; //note: cookies never cleared
    var data = req.body;
    var start = data.when.start; //in milliseconds
    var end = data.when.end; //in milliseconds
    var location = data.location; //comes as objectId
	var description = req.body.description;
	//form data
	var newEventJSON = {
    					"when": {"start":start, "end":end},
    					"status":status,
    					"host":host, 
    					"description":description,
    					"location": location //now it's ObjectId
    					};
	//check if the event is valid. If nonsense entered, it puts today's date  
    if (!eventValidityCheck(newEventJSON, today)){
    	res.json({success: 0, details : "Event happens in the past"});
    	return;
    }
    //all good, go on
    else {
    var newEvent = new Event(newEventJSON);
    newEvent.save(function(err){
    	if (err){
    		//console.log("Error creating a new event instance");
    		res.json({success:0, details:"Error creating a new event instance"});
    	}
    	else{
    		User.findOne({_id:host}, function(err, user){
    			if (err){
    				//console.log("Error adding an event to the User.events. "+err);
    				res.json({success:0, details:"Error adding an event to user"});
    			}
    			//SUCH USER EXISTS
    			else {
    				user.events.push(newEvent._id);
    				user.save(function(err){
    					if (err){
    						// console.log("Error adding an event to the User.events 2");
    						res.json({success:0, details:"Error adding an event to the User.events 2"});
    					}
    					else{
                            console.log("shoudl call emilaing now");
    						findSubscribers(req, res, newEvent); //success msg sent inside the function
    						// res.json({success:1, event: newEvent});
    					}
    				});
    			}
    		});
    	}
    });
}
});

/**********GET EVENT**********/
router.get('/:eventId', function(req,res){
	var eventId = req.params.eventId;
	Event.findById(eventId, function(err, doc){
		if (err){
            res.json({success: 0, details:"Error finding an event"});
			return;
		}
		res.json({success: 1, event: doc});
	});
});


/**********UPDATE EVENT**********/
router.put('/:eventId', function(req,res){
	var eventId = req.params.eventId;
	Event.findOne({_id:eventId}, function(err, doc){
		if (err){
			//console.log("Error while updating the event");
			res.json({success: 0, details:"Error while updating the event: "+eventId});
			return;
		}
		//update entries
        doc.when.start = req.body.when.start;
        doc.when.end = req.body.when.end;
        doc.description = req.body.description;
		doc.save(function(err){
		if (err){
            res.json({success: 0, details:"Error while updating the event: "+eventId});
			return;
		}
		res.json({success:1, event: doc});
		});
	});
});

/**********DELETE EVENT**********/
router.delete('/:eventId', function(req,res){
	var eventId = req.params.eventId;
	Event.remove({_id:eventId}, function(err){
		if (err){
			res.json({success:0, details:"Error while deleting the event: "+eventId});
		}
		else{
			User.update({_id:req.cookies.kerberos}, {$pull:{events:eventId}}, function(err, doc){
				if (err){
                    res.json({success:0, details:"Error while deleting the event: "+eventId});
				}
				else{
					res.json({success:1, user: doc});
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
