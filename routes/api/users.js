// Lead: Rebekah Cha
// Users API
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var request = require("request");
var User = require("../../models/User").User;
var Location = require("../../models/Location").Location;

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
            res.json({
                statusCode: 500,
                message: "mongoose get user error"
            });

    	} else {
    		if (u == undefined){

                request("http://m.mit.edu/apis/people/" + kerberos, function(err, resp, body) {
                    var user;

                    if (!err && resp.statusCode == 200 && (user = JSON.parse(body)).id != undefined) {
                        
                        var params = {
                            _id: user.id,
                            events: [],
                            subscriptions: []
                        };

                        var newUser = new User(params);

                        newUser.save(function(err, u) {
                            if (err) {
                                res.json({
                                    statusCode: 500,
                                    message: "mongoose create user error"
                                });
                            } else {
                                res.cookie("kerberos", req.body.kerberos);
                                res.cookie("login", "true");
                                res.json({
                                    statusCode: 200,
                                    user: u
                                });
                            }
                        });
                    } else {
                        res.json({
                            statusCode: 500,
                            message: "MIT server error or invalid kerberos"
                        });
                    }
                });
    		} else {
    			res.cookie("kerberos", req.body.kerberos);
                res.cookie("login", "true");
    			res.json({
                    statusCode: 200,
                    user: u
                });
    		}
    	}
    });
   
});


/*GET method for user */
router.get("/:userID/", function(req, res){
    console.log("user get method");
	//find users by :userID
	var userID = req.params.userID;

	User.findOne({'_id': userID})
	//Populate both subscriptions and events field
	.populate('subscriptions events')
	.exec(function(err, u){
		if(err){
            res.json({
                statusCode: 500,
                message: "mongoose get user error"
            });
		} else {
			//returning JSON object
            if (u == undefined) {
                res.json({
                    statusCode: 404,
                    message: "user not found"
                });
            } else {
                res.json({
                    statusCode: 200,
                    user: u
                });
            }
		}
	});
});


module.exports = router;