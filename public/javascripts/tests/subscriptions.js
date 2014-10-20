$(document).ready(function() {

	console.log("Testing Subscription API");
	test("testing Subscription post new", function(){

		var formData = {
	    	location: "54455c6e6959910b0056c131", //Alpha Epsilon Pi (AEPi)
	        time_block: 2
	    };
	    var newSubTest = new Subscription({
	                            "building":location,
	                            "time_block":time_block, 
	                            "users":["test"]
	                        });
	    var testjson = {success:1, details:"A subscription was added!", subscription:newSubTest};
	    $.ajax({
	        url: "/api/subscriptions/subscribe",
	        type: "POST",
	        data: formData,
	        success: function(data) {
	        	equal(data, testjson);
	        },
	        error: errorRedirect
	    });
	});

	test("testing delete Subscription", function(){
		var formData = {
	    	location: "54455c6e6959910b0056c131", //Alpha Epsilon Pi (AEPi)
	        time_block: 2
	    };
		$.ajax({
			url: "/api/subscriptions/subscribe",
			type: "DELETE",
			data: formData,
			success: function(data){
				console.log("TEST#2 RETURNED JSON", data);
				equal(data.success, 1);
			},
			error: errorRedirect
		});
	});

	test("testing GET Subscriptions", function(){
		var testjson = {success: 1, subscriptions: []};
		$.ajax({
			url: "/api/subscriptions",
			type: "GET", 
			success: function(data){
				console.log("Test#3 returned json get subscriptions", data);
				equal(data, testjson);
			}
		});
	});


});