$(document).ready(function() {

    $.ajax({
        url: "/api/users/login",
        method: "POST",
        data: {kerberos: "test"},
        success: function(data) {

            testLogin(data);

            var dummy_user = data.user;

            $.ajax({
                url: "/api/users/" + data.user._id,
                method: "GET",
                success: function(data) {
                    console.log("HI");
                    testUserGet(data, dummy_user);
                }
            });
        }

    });

    function compareArrays(a1, a2) {
        if (a1 instanceof Array && a2 instanceof Array) {
            if (a1.length == a2.length) {
                for (var i = 0; i < a1.length; i++) {
                    if (a1[i] != a2[i]) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        return false;
    }

    function testUserGet(data, dummy_user) {
        test("testing user get", function() {
            equal(data.success, 1, "Data successfully returned.");
            equal(data.user._id, dummy_user._id, "Username's are equal (" + dummy_user._id+ ").");
            equal(compareArrays(data.user.subscriptions, dummy_user.subscriptions), true, 
                "User subscriptions are equal size " + dummy_user.subscriptions.length + " array.");
            equal(data.user.events instanceof Array, true, 
                "User events are equal size " + dummy_user.events.length+ " array.");
        });
    }

    function testLogin(data) {
        test("testing user login", function() {
            equal(data.success, 1, "Data successfully returned.");
            equal(data.user._id, "test", "Username is correct (test).");
            equal(data.user.subscriptions instanceof Array, true, 
                "User subscriptions is a size " + data.user.subscriptions.length + " array.");
            equal(data.user.events instanceof Array, true, 
                "User events is a size " + data.user.events.length+ " array.");
        });
    }
});