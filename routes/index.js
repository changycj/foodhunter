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
router.get("/event_details/:eventId", function(req, res) {
    res.render("event", {});
});

// dummy post functions for testing
// simply sends what's received back
router.post("/test_post", function(req, res) {
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;
