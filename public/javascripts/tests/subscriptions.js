// Lead: Rebekah Cha
// testing Subscription API

// 1. POST new subscription
// 2. DELETE subscription
// 3. GET subscription

$(document).ready(function() {

		var formData = {
	    	location: "54455c6e6959910b0056c131", //Alpha Epsilon Pi (AEPi)
	        time_block: 2
	    };
	    $.ajax({
	        url: "/api/subscriptions/subscribe/user/test",
	        type: "POST",
	        data: formData,
	        success: function(data) {
	        	test("testing Subscription post new", function(){
	        		equal(data.statusCode= 200);
	        		equal(data.details, "A subscription was added!");
	        		equal(data.subscription.building, formData.location);
	        		equal(data.subscription.time_block, formData.time_block);
	        		console.log("users", data.subscription.users[0]);
	        		equal(data.subscription.users, "test");
	        	});	
	        }
	    });

	
		var formData = {
	    	location: "54455c6e6959910b0056c131", //Alpha Epsilon Pi (AEPi)
	        time_block: 2
	    };
		$.ajax({
			url: "/api/subscriptions/subscribe",
			type: "DELETE",
			data: formData,
			success: function(data){
				test("testing delete Subscription", function(){
				equal(data.statusCode, 200);
			});
			}
		});
	
		$.ajax({
			url: "/api/subscriptions/test",
			type: "GET", 
			success: function(data){
				test("testing GET Subscriptions", function(){
					console.log("data returned", data);
					equal(data.statusCode, 200);
				});
			},
			error: function(err){
				console.log(err);
			}
		});


});