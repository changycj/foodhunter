// Lead: Dana Mukusheva
// Subscriptions API
var express = require("express");
var router = express.Router();
var Subscription = require("../../models/Subscription").Subscription;
var User = require("../../models/User").User;
// var smtpPool = require('nodemailer-smtp-pool');

/********** REST API for subscription **********/

/* 
URL: /subscriptions  
1. method: GET, description: retrieves the list of user related subscriptions
   response: report success/failure, send list of subs

URL: /subscriptions/subscribe
1. method: POST, description: adds new subscription to a user's list
   response: report success/failure, send a new sub

2. method: DELETE, description: deletes existing subscription from a user's list
   response: report success/failure

URL: /subscriptions/building/:building/time_block/:time_block
1. method: GET, description: retrieves list of users for a specific subscription
   response: report success/failure
*/

// /********** GET USER LIST **********/
// //Note: is it used anywhere?
// router.get("/building/:building/time_block/:time_block", function(req, res) {
//     var building = req.params.building;
//     var time_block = req.params.time_block;  
//     Subscription.findOne({building: building, time_block: time_block})
//         .populate("users", "_id").exec(function(err, sub) {
//         if (err) {
//             res.json({success:0, details: "Error retrieving subscription. " + err});
//         } else {
//             res.json({success:1, subscription:sub});
//         }
    
//     });
// });

/********** GET SUBSCRIPTIONS **********/

router.get("/:user_id", function(req, res) {
    var userKerberos = req.params.user_id;

    User.findOne( { _id : userKerberos} ).populate("subscriptions").exec(function(err, user){

        if (err) {
            res.json({
                statusCode: 500,
                message: "mongoose find user error"
            });
        } else {
            if (user != undefined) {
                res.json({
                    statusCode: 200,
                    subscriptions: user.subscriptions
                });
            } else {
                res.json({
                    statusCode: 404,
                    message: "mongoose find user error"
                });
            }
        }
    });

});

/********** POST SUBSCRIPTION **********/

//Note: assumes the user exists in DB
router.post("/subscribe/user/:user_id", function(req, res) {
    //get data, bldg is an ObjectId, time_block is an int 0-3
    var time_block = req.body.time_block;
    var building = req.body.location;
     //list of subs
    var userKerberos = req.params.user_id;

    // first find out if subs already exist
    User.findOne({_id:userKerberos}, function(err, user){

        if (err){
            res.json({
                statusCode: 500,
                message: "Error finding the user who wants to subscribe"
            });
            return;
        }
        else if (user==undefined){ //should never get here
            res.json({
                statusCode: 404, 
                message:"Error finding the user who wants to subscribe, no such user"});
        } 
        else {
            var sub = {building:building, time_block:time_block};

            Subscription.findOne({building:sub.building, time_block: sub.time_block}, function (e, s){
                if (e){
                    //console.log("Error while fingding sub");
                    res.json({
                        statusCode: 500, 
                        message:"Error while fingding sub"
                    });
                }
                else{
                    //no such sub yet, create one
                    if (s==undefined || s==null){
                        var newSub = new Subscription({
                            building:sub.building,
                            time_block:sub.time_block, 
                            users:[userKerberos]
                        });
                        newSub.save(function(err){
                            if (err){
                                //console.log("Error while creating sub1");
                                res.json({
                                    statusCode:500, 
                                    message:"Error while creating sub1"});
                            }
                            //nothing happens, just save
                        });
                        //update corresponding user
                        user.subscriptions.push(newSub._id);
                        user.save(function(err){
                            if (err){
                                //console.log("Error adding a newly creating sub to user list");
                                res.json({
                                    statusCode: 500, 
                                    message:"Error adding a newly creating sub to user list"});
                            }
                            //nothing happens, just save
                        });
                        res.json({
                            statusCode: 200, 
                            subscription: newSub
                        });
                    }
                //there is such sub, update it by pushing a new user
                    else{
                        if (memberCheck(s.users, userKerberos)){
                            res.json({
                                statusCode: 409,
                                message : "User already subscribes to this."
                            });
                            return;
                        }
                        else{
                            s.users.push(userKerberos);
                            s.save(function(err){
                                if (err){
                                    //console.log("Error while creating sub2");
                                    res.json({
                                        statusCode : 500, 
                                        message :"Error while creating sub2"
                                    });

                                }
                                //do nothing, just save
                                return;
                            });
                        }

                        if (memberCheckObjectId(user.subscriptions, s._id)){
                            res.json({
                                statusCode: 409,
                                message: "User already subscribes to this."
                            });
                        }
                        else{
                            user.subscriptions.push(s._id);
                            user.save(function(err){
                                if (err){
                                    //console.log("Error adding an existing sub to user list");
                                    res.json({
                                        statusCode : 500, 
                                        message : "Error adding an existing sub to user list"});
                                }
                                return;
                            });
                        }
                    }
                }
            });
        }
    });
});

/********** DELETE SUBSCRIPTION **********/

router.delete("/subscribe/user/:user_id", function(req,res){
    var building = req.body.location;
    var time_block = req.body.time_block;

    var userKerberos = req.params.user_id;

    Subscription.findOne({building:building, time_block:time_block}, function(err, sub){
        if (err){
            //console.log("Error deleting user from subscription list:");
            res.json({ 
                statusCode: 500, 
                message:"Error deleting user from subscription list"});
        }
        else{
            if (sub == null || sub == undefined){
                console.log("subscription delete error");
                res.json({
                    statusCode: 404, 
                    message: "Subscription does not exist anyways"});

            } else {
                var index = sub.users.indexOf(userKerberos);
                if (index!==-1){
                    sub.users.splice(index,1);
                }
                sub.save(function(err){
                    if (err){
                        //console.log("Error deleting user from subscription list:");
                        res.json({
                            statusCode: 500, 
                            message:"Error deleting user from subscription list"});
                    }
                });
                //delete subscription from a user list
                User.update({_id:userKerberos}, {$pull:{subscriptions:sub._id}}, function(err, user){
                    if (err){
                        //console.log("Error while deleting sub from usr's list");
                        res.json({
                            statusCode: 500, 
                            message: "Error deleting sub from user's list: kerberos "+ userKerberos});
                    }
                    else{
                        res.json({
                            statusCode: 200 
                        }); 
                        //res.redirect('/events');
                    }
                });
            }
        }
    });
});

//*******HELPER****
//DESCRIPTION: checks if the elements is in the list
//INPUT: iterable, element
//OUTPUT: true if is member, false otherwise
function memberCheck(list, el){
    var l = list.length;
    for (var i = 0; i< l; i++){
        if (el===list[i]){
            return true;
        }
    }
    return false;
}
//DESCRIPTION: checks if the elements is in the list
//INPUT: iterable (objectIds), element (objectId)
//OUTPUT: true if is member, false otherwise
function memberCheckObjectId(list, el){
    var l = list.length;
    for (var i = 0; i< l; i++){
        if (el.toString()===list[i].toString()){
            return true;
        }
    }
    return false;
}
module.exports = router;