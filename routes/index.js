var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {    
    res.redirect("/login");
});

// GET login page
router.get("/login", function(req, res) {
    res.render("login", {});
});

// GET event details page
router.get("/event_details", function(req, res) {
    res.render("details", {event_id: req.query.event_id});
});

router.get("/tests/:api_name", function(req, res) {
    var api = req.params.api_name;

    res.cookie("kerberos", "test");
    res.cookie("login", "true");
    res.render("tests/" + api, {});
    // if (api == "locations") {
    //     res.render("tests/locations", {});

    // } else if (api == "events") {
    //     res.render("tests/events", {});

    // } else if (api == "users") {
    //     res.render("tests/users", {});

    // } else if (api == "subscriptions") {
    //     res.render("tests/subscriptions");

    // }
    res.redirect("/");
});

// dummy post functions for testing
// simply sends what's received back
router.post("/test_post", function(req, res) {
    console.log(req.body);
    res.json({success: 1, content: req.body});
});

module.exports = router;
