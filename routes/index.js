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
    res.redirect("/");
});

router.post("/test_post", function(req, res) {
    console.log(req.body);
    console.log("HELLO!");
});

module.exports = router;
