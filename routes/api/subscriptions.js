var express = require("express");
var router = express.Router();
var subscription = require("../../models/Subscription");
var User = require("../../models/User").User;

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
            res.json(sub);
        }
    
    });
});

/*ADD new subscriptions, update old subscriptions by pushin new users*/
//assumes the user exists in DB
router.post("/subscribe", function(req, res) {
    //get data, bldg is an ObjectId, time_block is an int 0-3
    var subscriptions = req.body.subscriptions; //list of subs
    console.log("GOT SUBS: "+subscriptions);
    var userKerberos = req.cookies.kerberos;
    // first find out if subs already exist
    var numSubs = subscriptions.length;
    User.findOne({_id:userKerberos}, function(err, user){
        if (err){
            console.log("Error finding the user who wants to subscribe");
            res.json({message:0, details:"Error finding the user who wants to subscribe"});
            return
        }

        for (var i = 0; i < numSubs; i++){
            var sub = subscriptions[i];
            subscription.Subscription.findOne({building:sub.building, time_block: sub.time_block}, function (err, s){
                if (err){
                    console.log("Error while fingding sub");
                    res.json({message:0, details:"Error while fingding sub"});
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
                                res.json({message:0, details:"Error while creating sub1"});
                            }
                            return;
                        });
                        user.subscriptions.push(newSub._id);
                        user.save(function(err){
                            if (err){
                                console.log("Error adding a newly creating sub to user list");
                                res.json({message:0, details:"Error adding a newly creating sub to user list"});
                            }
                            return;
                        });
                    }
                    //there is such sub, update it by pushing a new user
                    else{
                        s.users.push(userKerberos);
                        s.save(function(err){
                            console.log("Error while creating sub2");
                            res.json({message:0, details:"Error while creating sub2"});
                            return;
                        });
                        user.subscriptions.push(s._id);
                        user.save(function(err){
                            if (err){
                                console.log("Error adding an existing sub to user list");
                                res.json({message:0, details:"Error adding an existing sub to user list"});
                            }
                            return;
                        });
                    }
                }

            });
        }
    });
    res.json({message:1, details:"All subscriptions were added!"});
});

//var location = require("../../models/Location");
//
//// REST API for location
//
//// GET find list of locations
//router.get("/", function(req, res) {
//    location.Location.find(req.query).sort({building: "asc"}).exec(function(err, locs) {
//        if (err) {
//            res.send("Error retrieving location info. " + err);
//        } else {
//            console.log(locs);
//            res.json(locs);
//        }
//    });
//});
//
//// GET specific location information
//router.get("/:id", function(req, res) {
//    var locId = req.params.id;
//
//    location.Location.find( {"_id" : locId} ).limit(1).exec(function(err, loc) {     
//        if (err) {
//            res.send("Error retrieving location info. " + err);
//        } else {
//            console.log(loc);
//            res.json(loc[0]);   
//        }
//    });
//});
//
module.exports = router;