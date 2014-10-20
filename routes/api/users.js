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
            res.json({success: 0})
    	} else {
    		if (u == undefined){
    			/*POST new user*/
                var params = {
                    '_id': kerberos,
                    events : [],
                    subscriptions : []
                };
				var newUser = new User(params);
				newUser.save(function(err, newUser){
					if (err){
						res.send("Error saving new user");
					} else {
						res.cookie("kerberos", req.body.kerberos);    				
						res.cookie("login", "true");
    					res.json({success: 1, user: params});
					}
				});
    		} else {
    			res.cookie("kerberos", req.body.kerberos);
    			res.cookie("login", "true");
                console.log(u);
    			res.json({success: 1, user: u});
    		}
    	}
    });
   
});


/*GET method for user */
router.get("/:userID/", function(req, res){
	//find users by :userID
	var userID = req.params.userID;
    console.log(userID);
	User.findOne({'_id': userID})
	//Populate both subscriptions and events field
	.populate('subscriptions events')
	.exec(function(err, u){
		if(err){
            res.json({success: 0});
		} else {
			//returning JSON object
            console.log(u);
			res.json({success: 1, user: u});
		}
	});
});


module.exports = router;