$(document).ready(function() {

    // login form
    $("#form_login").submit(function(e) {
        e.preventDefault();
        // authenticate!!!
        var formData = { kerberos: $("input[name='kerberos']").val()};
                
        $.ajax({
            url: "/api/users/login",
            method: "POST",
            data: formData,
            success: function(data) {
                if (data.success == 1) {
                    window.location = "/map?kerberos=" + data.user._id;
                } else {
                    errorRedirect();
                }
            },
            error: errorRedirect
        });
    });

    $("#tests_list a").click(function(e) {
        e.preventDefault();
        console.log("HI!");

    });

    function errorRedirect() {
        alert("ERROR!");
        window.location = "/";
    }

});