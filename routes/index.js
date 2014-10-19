var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {    
    res.redirect("/users/login");
});



// dummy post functions for testing
// simply sends what's received back
router.post("/test_post", function(req, res) {
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;
