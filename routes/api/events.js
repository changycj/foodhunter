// TODO: email sendout

var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
//get models
var Event = require('../../models/Event').Event;
var User = require("../../models/User").User;
var Location = require("../../models/Location").Location;
var Subscription = require("../../models/Subscription").Subscription;
var nodemailer = require("nodemailer");

/*
findSubscribers finds the subscriptions related to the event
and returns a list of users signed up for that subscription.
Params: event
Returns: list of users
*/
var findSubscribers = function(req, res, newEvent){
	var subscribers = [];
	Location.findOne({"_id": newEvent.location}).exec(function(err, loc){
		if (err){
			console.log("Error finding location of event");
		} else {
			var times = [];
			var building = loc;
			var dStart = new Date(newEvent.when.start).getHours();
			var dEnd = new Date(newEvent.when.end).getHours();
			var startEnd = [dStart, dEnd];
			if (dStart == dEnd){
				var timeBlock = Math.floor(dStart/6);
				if (times.indexOf(timeBlock) == -1){
					times.push(timeBlock);
				}
			} else{
				for (var i = 0; i < startEnd[1]-startEnd[0]; i+=6){
					var timeBlock = Math.floor((startEnd[0]+i)/6);
					if (times.indexOf(timeBlock) == -1){
						times.push(timeBlock);
					}
				}
			}
			Subscription.find({"building": building, "time_block": { $in: times}})
			.populate('users')
			.exec(function(e, subs){
				if (e) {
					console.log("Error finding subscriptions from new event");
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
emailOut emails out to the list of subscribed users.
Called when a new event is added.
params: subscribers is a list of users
*/
var emailOut = function(subscribers, newEvent, loc){
	 	console.log(loc);
	 	var eventStart = new Date(newEvent.when.start);
	 	var eventEnd = new Date(newEvent.when.end);
        // var smtpTransport = nodemailer.createTransport(smtpPool({
        var smtpTransport = nodemailer.createTransport('SMTP',{
            service: 'SendGrid',
            host:'smtp.sendgrid.net',
            port:'587',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            },
            domain: 'heroku.com'
            // maxConnections: 20,
            // maxMessages: Infinity
        });
        // }));
        var mailOptions = {
            bcc: subscribers,
            from: 'foodhunterproject@mit.edu',
            subject: 'Free Food ' + eventStart.getMonth() + "/" + eventStart.getDate() + ' in ' + loc.name,
            text: 'Time: ' + eventStart.getHours() + ":" + eventStart.getMinutes() + ' - ' 
           		+ eventEnd.getHours() + ":" + eventEnd.getMinutes() + '\n'
           		+ 'Description: ' + newEvent.description + '\n'
           		+ 'Hosted by: '+ newEvent.host
            	+'\n\n You are receiving this because you (or someone else) has subscribed to the free food mailing list for ' + newEvent.location.name + '.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err){
            if(err) console.log(err);
        });
};

// GET ALL EVENTS
/*Currently in the test mode. Might not be needed in the deployed version*/
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
    var location = data.location; //comes as objectId already :)
	var description = req.body.description;
	
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
    		console.log("Error creating a new event instance");
    		res.json({success:0, details:"Error creating a new event instance"});
    	}
    	else{
    		User.findOne({_id:host}, function(err, user){
    			if (err){
    				console.log("Error adding an event to the User.events. "+err);
    				res.json({success:0, details:"Error adding an event to user"});
    			}
    			//SUCH USER EXISTS
    			else {
    				console.log('user!!', user);
    				user.events.push(newEvent._id);
    				user.save(function(err){
    					if (err){
    						console.log("Error adding an event to the User.events 2");
    						res.json({success:0, details:"Error adding an event to the User.events 2"});
    					}
    					else{
    						findSubscribers(req, res, newEvent);
    					}
    				});
    			}
    		});
    	}
    });
}
});

/*********GET individual event info*********/
router.get('/:eventId', function(req,res){
	var eventId = req.params.eventId;
	Event.findById(eventId, function(err, doc){
		if (err){
            res.json({success: 0})
			return;
		}
		res.json({success: 1, event: doc}); //just send a JSON object
	});
});

/*********UPDATE current event*********/
//TODO: need to be tested
router.put('/:eventId', function(req,res){
	var eventId = req.params.eventId;
	// var fieldToChange = req.body.fieldToChange; 
	// // Possible values: "location", "date", "start", "end", "status", "description"
	// var newValue = req.body.newValue;
	Event.findOne({_id:eventId}, function(err, doc){
		if (err){
			console.log("Error while updating the event");
			return;
		}
		else{
            doc.when.start = req.body.when.start;
            doc.when.end = req.body.when.end;
            doc.description = req.body.description;
			// if (fieldToChange==="date"){
			// 	doc.when.date = newValue;
			// }
			// else if(fieldToChange==="location"){
			// 	doc.location = newValue;
			// }
			// else if (fieldToChange==="start"){
			// 	doc.when.time.start = newValue;
			// }
			// else if (fieldToChange==="end"){
			// 	doc.when.time.end = newValue;
			// }
			// else if (fieldToChange==="status"){
			// 	doc.status = newValue;
			// }
			// else if (fieldToChange==="description"){
			// 	doc.description = newValue;
			// }
			// else{
			// 	console.log("Error updating the event instance");
			// }
		}
		doc.save(function(err){
			if (err){
                res.json({success: 0})
				return;
			}
			//res.send(doc);
			//res.redirect('/event/'+eventId);
			res.json({success:1, event: doc});
		});
	});
});

/*********DELETE an event*********/
//TODO: delete event from Users.events list - DONE, but needs to be tested
//
router.delete('/:eventId', function(req,res){
	var eventId = req.params.eventId;
	Event.remove({_id:eventId}, function(err){
		if (err){
			res.json({success:0});
		}
		else{
			User.update({_id:req.cookies.kerberos}, {$pull:{events:eventId}}, function(err, doc){
				if (err){
                    res.json({success:0});
				}
				else{
					res.json({success:1});
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
