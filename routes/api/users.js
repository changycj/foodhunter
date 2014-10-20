// Lead: Rebekah Cha
// Users API
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../../models/User").User;

/********** REST API for user **********/

/* 
URL: users/login

1. method: POST, description: authentificates 
   or creates new user if never visited before
   response: report success/failure, send a user data

URL: /users/:userID
1. method: GET, description: retrieves individual user info
   response: report success/failure, send a user data
*/


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
						res.json({success: 0, details: "Error creating a new user"});
					} else {
						res.cookie("kerberos", req.body.kerberos);    				
						res.cookie("login", "true");
    					res.json({success: 1, user: params});
					}
				});
    		} else {
    			res.cookie("kerberos", req.body.kerberos);
    			res.cookie("login", "true");
                //console.log(u);
    			res.json({success: 1, user: u});
    		}
    	}
    });
   
});


/*GET method for user */
router.get("/:userID/", function(req, res){
	//find users by :userID
	var userID = req.params.userID;
    //console.log(userID);
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