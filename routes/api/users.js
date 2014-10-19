var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
// var location = require("../models/Location");
var user = require("../models/User.js");


/*GET method for user */
router.get("/:userID/", function(req, res){
	//find users by :userID
	var userID = req.params.userID;
	user.User.findOne({'_id': userID})
	//Populate both subscriptions and events field
	.populate('subscriptions events')
	.exec(function(err, u){
		if(err){
			res.send('Error populating user subscriptions');
		} else {
			//returning JSON object
			res.json(u);
		}
	});
}

/*POST new user to database */ //<-- most likely will be nested inside POST method in subscriptions

module.exports = router;