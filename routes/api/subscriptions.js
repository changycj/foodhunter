var express = require("express");
var router = express.Router();
var subscription = require("../../models/Subscription");
var user = require("../../models/User");
var nodemailer = require('nodemailer');


// REST API for subscription

// retrieves user list for a specific subscription
router.get("/building/:building/time_block/:time_block", function(req, res) {
    var building = req.params.building;
    var time_block = req.params.time_block;
    
    subscription.Subscription.find({building: building, time_block: time_block})
        .limit(1).populate("users", "kerberos").exec(function(err, sub) {
        
        if (err) {
            res.send("Error retrieving subscription. " + err);
        } else {
            res.json(sub[0]);
        }
    
    });
});

// add user to subscriptions
// router.post("/subscribe", function(req, res) {
//     var subscriptions = req.body.subscriptions;
    
//     // find user
//     user.User.find({kerberos: req.cookies.kerberos}, {_id: 1}).limit(1).exec(function(err, user) {
//         if (err) {
//             res.send("Error retrieving user. " + err);
//         } else {
            
//             // subscribe
//             subscription.Subscription.update({$in: subscriptions}, {$addToSet: { users: user[0]._id}})
//                 .exec(function(err2, subs) {
//                 if (err2) {
//                     res.send("There was a problem adding subscriptions. " + err2);
//                 } else {
//                     console.log(subs);
//                 }
//             });
//         }
//     });
// });

router.post("/subscribe", function(req, res){
    // function(token, done){
        //later query so that if finds all users that has this specific subscription in the list
        // user.User.findOne({'_id': req.body.kerberos}, function(err, user){
        //     if (! user) {
        //         res.send("not this user");
        //     }
        // });
        console.log("entered subscribe method");
        var smtpTransport = nodemailer.createTransport('SMTP', {
            service: 'Gmail',
            auth: {
                user: 'foodHunter',
                pass: 'food'
            }
        });
        var mailOptions = {
            // to: user.kerberos + "@mit.edu",
            bcc: 'rcha@mit.edu',
            from: 'foodHunter@gmail.com',
            subject: 'Free Food Event',
            text: 'You are receiving this because you (or someone else) has subscribed to the free food mailing list for this building.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err){
                // req.flash('info', 'An email has been sent to')
            if(err){
                console.log(err);
            } else {
                console.log("message sent");
            }
            smtpTransport.close();
        });
        res.json(1);
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