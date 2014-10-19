var express = require("express");
var router = express.Router();
var subscription = require("../../models/Subscription");
var User = require("../../models/User").User;
var nodemailer = require('nodemailer');
// var smtpPool = require('nodemailer-smtp-pool');

// REST API for subscription

// retrieves user list for a specific subscription
router.get("/building/:building/time_block/:time_block", function(req, res) {
    var building = req.params.building;
    var time_block = req.params.time_block;
    
    subscription.Subscription.findOne({building: building, time_block: time_block})
        .populate("users", "_id").exec(function(err, sub) {
        
        if (err) {
            res.send("Error retrieving subscription. " + err);
        } else {
            res.json({message:1, element:sub});
        }
    
    });
});
/******GET list of user related subs*******/
//Sends a list of user related subscriptions (list of json)

router.get("/", function(req, res) {
    var userKerberos = req.cookies.kerberos;
    console.log("HI");
    User.findOne({_id:userKerberos}).populate("subscriptions").exec(function(err, user){
        if (!(user==undefined)){
           res.json(user.subscriptions);
        }
        else{
            res.json({message:0, details: "No such user yet"});
        }
    });
});

/*ADD new subscriptions, update old subscriptions by pushin new users*/
//assumes the user exists in DB
router.post("/subscribe", function(req, res) {
    //get data, bldg is an ObjectId, time_block is an int 0-3
    var subscriptions = req.body.subscriptions; //list of subs
    console.log("GOT SUBS: "+JSON.stringify(subscriptions));
    var userKerberos = req.cookies.kerberos;
    // first find out if subs already exist
    var numSubs = subscriptions.length;
    User.findOne({_id:userKerberos}, function(err, user){
        if (err){
            console.log("Error finding the user who wants to subscribe");
            res.json({message:0, details:"Error finding the user who wants to subscribe"});
            return;
        }

        for (var i = 0; i < numSubs; i++){
            var sub = subscriptions[i];
            subscription.Subscription.findOne({building:sub.building, time_block: sub.time_block}, function (err, s){
                if (err){
                    console.log("Error while fingding sub");
                    //res.json({message:0, details:"Error while fingding sub"});
                    return;
                }
                else{
                    //no such sub yet, create one
                    if (s==undefined){
                        var newSub = new subscription.Subscription(
                                                    {building:sub.building, time_block:sub.time_block, users:[userKerberos]});
                        newSub.save(function(err){
                            if (err){
                                console.log("Error while creating sub1");
                                //res.json({message:0, details:"Error while creating sub1"});
                            }
                            return;
                        });
                        user.subscriptions.push(newSub._id);
                        user.save(function(err){
                            if (err){
                                console.log("Error adding a newly creating sub to user list");
                                //res.json({message:0, details:"Error adding a newly creating sub to user list"});
                            }
                            return;
                        });
                    }
                    //there is such sub, update it by pushing a new user
                    else{
                        s.users.push(userKerberos);
                        s.save(function(err){
                            console.log("Error while creating sub2");
                            //res.json({message:0, details:"Error while creating sub2"});
                            return;
                        });
                        user.subscriptions.push(s._id);
                        user.save(function(err){
                            if (err){
                                console.log("Error adding an existing sub to user list");
                                //res.json({message:0, details:"Error adding an existing sub to user list"});
                            }
                            return;
                        });
                    }
                }

            });
        }
    res.json({message:1, details:"All subscriptions were added!"});
    });
    
});

/*Delete a single subscription from current user's list*/
router.delete("/:subId", function(req,res){
    var subId = req.params.subId;
    var userKerberos = req.cookies.kerberos;
    //delete a user from subscription list
    subscription.Subscriptions.update({_id:subId}, {$pull:{users:userKerberos}}, function(err){
        if (err){
            console.log("Error deleting user from subscription list: subId "+ subId);
            res.json({message:0, details:"Error deleting user from subscription list: subId "+ subId});
        }
        else{
            //delete subscription from a user list
            User.update({_id:userKerberos}, {$pull:{subscriptions:subId}}, function(err, user){
                if (err){
                    console.log("Error while deleting sub from usr's list");
                    res.json({message:0, details:"Error deleting sub from user's list: kerberos "+ userKerberos});
                }
                else{
                    res.json({message:1, element: user});
                    //res.redirect('/events');
                }
            });
            
        }
    });
});

module.exports = router;