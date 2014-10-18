var express = require('express');
var router = express.Router();
var EventAPI =require('../API/Event.js');


/* GET home page. */
router.get('/', function(req, res) {
    res.redirect("/map");
});

//TEST to check event methods
router.get('/testevent', function(req,res){
	res.render('testevent', {title:"TESTMODE"});
});
router.post('/testevent', function(req,res){

	var newEvent  = req.body.newEvent;
	EventAPI.makeEvent(newEvent);
	res.send('success');
});


module.exports = router;
