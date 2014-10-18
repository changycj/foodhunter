//methods to interact with Event collection

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Event = require('../models/Event').Event; //import models
var Location = require('../models/Location').Location;


//DESCRIPTION: create new Event instance, add to Event collection
//INPUT: legal JSON object
//OUTPUT: nothing
function makeEvent(newEvent){

	var ev = new Event({"host":"test2"});

	ev.save(function(err){
		if (err){
			console.log("Error creating new event: "+ newEvent);
		}
		else{
			console.log('Successfully added new event');
		}
	});
}

//DESCRIPTION: remove event from Event collection
//INPUT: legal JSON object
//OUTPUT: nothing
var removeEvent = function(ev){
	var evId = ed.id;
	Event.remove({_id: evId}, function(err){
		if (err){
			console.log("Error removing event: "+ ev);
		}
		else{
			console.log('Successfully removed event');
		}

	});
}

//DESCRIPTION: search for events by parameters
//INPUT: "host", "location", "startTime", "date"
//OUTPUT: list of JSON objects

module.exports.makeEvent = makeEvent;
