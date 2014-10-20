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
	//post event first

	//make some dummy data
	var formData = {
                    when: {
                        start: 1000,
                        end: 1000
                    },
                    description: "TEST POSTING EVENT",
                    location: "544552d424a285661925bd91"
                };

    $(".data_to_post").append("<p>"+"POST INPUT: "+formData+"</p>");
    //post smth            
    $.ajax({
    url: "/api/events",
    type: "POST",
    data: formData,
    cache: false,
    success: function(data) {
        if (data.success== 1) {
        	var dataInfo = data.event;
            $(".post_result").append("<p>"+"POST RESULT: "+dataInfo+"</p>");
            window.location.reload();

        } else {
            alert("Can't post new event1"+data.success);
        	window.location = "/";
        }
    },
    error: function(){
    		alert("Can't post new event2");
        	window.location = "/";	
    }
    
});            
});