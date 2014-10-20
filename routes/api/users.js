var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
// var location = require("../models/Location");
var User = require("../../models/User").User;
//realm used for kerberos authentication
// var passport = require("passport-kerberos");

// var REALM = "EXAMPLE.COM"

// passport.use(new KerberosStrategy(function(username, done){
// 	user.User.findONe({username: username}, function(err, user){
// 		if (err) {return done(err);}
// 		if (!user){return done(null, false);}
// 		return done(null, user, REALM);
// 	});
// }));
//!!!! need to work on authentication

// POST login user
router.post("/login", function(req, res) {
    // TODO: need to make sure user exists with certificates
    var kerberos = req.body.kerberos;
    User.findOne({'_id': kerberos}).exec(function(err, u){
    	if(err){
    		res.send("Error finding user to login");
    	} else {
    		console.log('querying for users');
    		if (u == undefined){
    			console.log("undefined user");
    			/*POST new user*/
				var newUser = new User({
					'_id': kerberos,
					events : [],
					subscriptions : []
				});
				newUser.save(function(err, newUser){
					if (err){
						res.send("Error saving new user");
					} else {
						res.cookie("kerberos", req.body.kerberos);    				
						res.cookie("login", "true");
    					res.json(req.body.kerberos);
					}
				});
    		} else {
    			res.cookie("kerberos", req.body.kerberos);
    			res.cookie("login", "true");
    			res.json(req.body.kerberos);
    		}
    	}
    });
   
});


/*GET method for user */
router.get("/:userID/", function(req, res){
	//find users by :userID
	var userID = req.params.userID;
	User.findOne({'_id': userID})
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
});


module.exports = router;