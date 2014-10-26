// Lead: Judy Chang
// Main page router

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.clearCookie("kerberos");

    res.redirect("/login");
});

// GET login page
router.get("/login", function(req, res) {
    res.clearCookie("kerberos");
    
    res.render("login", {});
});

// GET logout
router.get("/logout", function(req, res) {
    res.clearCookie("kerberos");
    res.redirect("/login");
});

// GET event details page
router.get("/event_details", function(req, res) {
    res.render("details", {event_id: req.query.event_id});
});

// GET test scripts
router.get("/tests/:api_name", function(req, res) {
    var api = req.params.api_name;

    res.cookie("kerberos", "test");
    
    if (api == "locations") {
        res.render("tests/locations", {});

    } else if (api == "events") {
        res.render("tests/events", {});

    } else if (api == "users") {
        res.render("tests/users", {});

    } else if (api == "subscriptions") {
        res.render("tests/subscriptions");
    } else {
        res.redirect("/");
    }
});

// dummy post functions for testing
// simply sends what's received back
router.post("/test_post", function(req, res) {
    console.log(req.body);
    res.json({
        statusCode: 200, 
        content: req.body
    });
});

module.exports = router;
