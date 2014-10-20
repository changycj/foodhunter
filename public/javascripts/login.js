// Lead: Judy Chang
// login page
$(document).ready(function() {

    // login form
    $("#form_login").submit(function(e) {
        e.preventDefault();
        // TODO: authenticate!!!
        var formData = { kerberos: $("input[name='kerberos']").val()};

        // POST to login        
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

    // link to testing scripts
    // automatically login dummy user with id "test" before loading link
    $("#tests_list a").click(function(e) {
        e.preventDefault();
        var link = $(this).attr("href");
        $.ajax({
            url: "api/users/login",
            method: "POST",
            data: {kerberos: "test"},
            success: function(data) {

                if (data.success == 1) {                
                    window.location = link;
                } else {
                    errorRedirect();
                }       
            },
            error: errorRedirect
        })

    });

    function errorRedirect() {
        alert("ERROR!");
        window.location = "/";
    }

});