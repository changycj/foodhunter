var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
// var location = require("../models/Location");
var user = require("../models/User.js");
var subscription = require("../models/Subscription.js");


/*GET method for user */
router.get("/:userID/", function(req, res){
	//find users by :userID
	var userID = req.params.userID;
	user.User.findOne({'_id': userID}, function(err, u){
		if (err){
			res.send("Error finding User");
		} else {
			//u.subscriptions is currently a list of subscriptionIDs.
			//Want to populate it to be the actual subscription object
			user.User.populate(u, {path: "subscriptions"}, function(e, result){
				if (e){
					res.send("Error populating subscriptions in user");
				} else {
					//UI url may change depending on where the view file is
					res.render('/users/profile', {user: u});
				}
			}
		}
	});
}

/*POST new user to database */

module.exports = router;