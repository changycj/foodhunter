var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.redirect("/map");
});

// POST login user
router.post("/login", function(req, res) {
    
    // TODO: need to make sure user exists with certificates
    res.cookie("kerberos", req.body.kerberos);
    res.json(req.body);
});

// dummy post functions for testing
// simply sends what's received back
router.post("/test_post", function(req, res) {
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;
