/* Some random location from the DB
{
	"_id" : ObjectId("544552d424a285661925bd91"),
	"building" : "35",
	"name" : "Sloan Laboratory",
	"gps" : {
		"lat" : 42.3603823,
		"lon" : -71.0940274
	},
	"__v" : 0
}
*/
$(document).ready(function() {
    //form some dummy event, host is predefined
    var today = new Date().valueOf();
    var offset = 1000000000;
    var eventLen = 500000000;
    var testDescription = "TEST POSTING EVENT";
    var testLocation = "544552d424a285661925bd91";
    var formData = {
                    when: {
                        start: today+offset,
                        end: today+offset+eventLen
                    },
                    description: testDescription,
                    location: testLocation
                };
    //post event and see if it returns the same object         
    $.ajax({
    url: "/api/events/user/changycj",
    method: "POST",
    data: formData,
    cache: false,
    success: function(data) {

        if (data.statusCode == 200) {
            var dataInfo = data.event;

            QUnit.test("POST to /events", function(assert){
                equal(dataInfo.description,testDescription,"Description is the same");
                equal(dataInfo.location,testLocation,"Location is the same");
                equal(dataInfo.when.end,today+offset+eventLen,"End time is the same");
                equal(dataInfo.when.start,today+offset,"Start time is the same");
            });
            //access the individual event page, see if it successfully  retrieves
            getOneEvent(dataInfo);


        } else {
            QUnit.test("POST to /events", function(assert){
                assert.ok(false,"Error while posting the event");
            });
        }
    },
    error: function(){
            QUnit.test("POST to /events", function(assert){
                assert.ok(false,"Error while posting the event");
            });
    }
    
    }); 
    
    //retrieves all available events in the DB
    function getAllEvents(deleted, idOfDeleted){
        $.ajax({
        url: "/api/events",
        method: "GET",
        success: function(data) {

            if (data.statusCode== 200) {

                var dataInfo = data.events;
                //expect the list to not contain some specific object
                if (deleted){
                    QUnit.test("DELETE /events", function(assert){
                        //membercheck should return false, false is good
                        assert.ok(!memberCheckObjectId(dataInfo, idOfDeleted),"Event was deleted");
                    });
                }
                else{
                    //expect the list to be nonempty
                QUnit.test("GET /events", function(assert){
                    notEqual(dataInfo.length,0,"Non empty event list");
                });
            }
            } else {
                QUnit.test("GET to /events", function(assert){
                    assert.ok(false,"Error while getting all events");
                });
            }
        },
        error: function(){
                QUnit.test("GET to /events", function(assert){
                    assert.ok(false,"Error while getting all events");
                });
        }
        
        });
    }
    getAllEvents(false);

    //retrieve one specific event and all the related info
    function getOneEvent(event){
        //parse event details
        var eventId = event._id;
        var eventDescr = event.description;
        var eventLoc = event.location;
        var eventStart = event.when.start;
        var eventEnd = event.when.end;
        $.ajax({
        url: "/api/events/"+eventId,
        method: "GET",
        success: function(data) {

            if (data.statusCode== 200) {

                var dataInfo = data.event;
                //compare event details with what was returned
                QUnit.test("GET /events/:eventId", function(assert){
                    equal(dataInfo.description,eventDescr, "Same event description as expected");
                    equal(dataInfo._id,eventId, "Same event ID as expected");
                    equal(dataInfo.location, eventLoc, "Same event location as expected");
                    equal(dataInfo.when.start,eventStart, "Same event start date as expected");
                    equal(dataInfo.when.end,eventEnd, "Same event end date as expected");
                });
                //change this event and see if the returned object was updated
                updateOneEvent(dataInfo);
            } else {
                QUnit.test("GET to /events/:eventId", function(assert){
                    assert.ok(false,"Error while getting the event");
                });
            }
        },
        error: function(){
                QUnit.test("GET to /events/:eventId", function(assert){
                    assert.ok(false,"Error while getting the event");
                });
        }
        
        });
    }
    //can edit start time, end time, description
    function updateOneEvent(event){
        var eventId = event._id;
        var newStartTime = today+2*offset;
        var newEndTime = today+3*offset;
        var newDescription = "NEW DESCRIPTION";
        var newData = {description:newDescription, when :{start:newStartTime, end:newEndTime}};
        
        $.ajax({
            url: "/api/events/"+eventId+"/user/changycj",
            method: "PUT",
            data:newData,
            cache:false,
            success: function(data) {

                if (data.statusCode== 200) {

                    var dataInfo = data.event;
                    //compare event details with what was returned
                    QUnit.test("PUT /events/:eventId", function(assert){
                        equal(dataInfo.description, newDescription, "New event description");
                        equal(dataInfo.when.start,newStartTime, "New event start date");
                        equal(dataInfo.when.end,newEndTime, "New event end date");
                    });
                    //now remove that event
                    removeOneEvent(dataInfo);
                } else {
                    QUnit.test("PUT /events/:eventId", function(assert){
                        assert.ok(false,"Error while updating the event");
                    });
                }
            },
            error: function(){
                    QUnit.test("GET to /events/:eventId", function(assert){
                        assert.ok(false,"Error while updating the event");
                    });
            }
        });

    }

    //ASSUMES THAT NOTHING BUT THIS TEST CASE WERE RUNNING
    //removes the event, since it's the only event in the db, check if GET /events returns the empty list
    function removeOneEvent(event){
        var eventId = event._id;
        
        $.ajax({
            url: "/api/events/"+eventId+"/user/changycj",
            method: "DELETE",
            success: function(data) {

                if (data.success== 1) {
                    //look if getAllEvents() confirms that there are no more events
                    getAllEvents(true, eventId);
                } else {
                    QUnit.test("DELETE /events/:eventId", function(assert){
                        assert.ok(false,"Error while deleting the event:success");
                    });
                }
            },
            error: function(){
                    QUnit.test("DELETE to /events/:eventId", function(assert){
                        assert.ok(false,"Error while deleting the event");
                    });
            }
        });

    }

    function memberCheckObjectId(list, objId){
        var l = list.length;
        for (var i = 0; i< l; i++){
            if (list[i]._id===objId){
                return true;
            }
        }
        return false;
    }


});