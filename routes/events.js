var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	var allEvents  =  EventAPI.getAllEvents();
    res.render("testevent", {title:"test event mode", allEvents:allEvents});
});

router.post('/', function(req,res){
	var startTime = req.body.startTime;
	var endTime = req.body.endTime;
	var date = new Date(req.body.date);
	EventAPI.makeEvent({"host":"test2", "when":{"time":{"start":startTime, "end":endTime}, "date": date}});
	res.send('success');
});



module.exports = router;
