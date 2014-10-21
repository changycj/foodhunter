// Lead: Judy Chang
// login page
$(document).ready(function() {

    // login form
    $("#form_login").submit(function(e) {
        e.preventDefault();

        var formData = { kerberos: $("input[name='kerberos']").val()};

        // POST to login        
        $.ajax({
            url: "/api/users/login",
            method: "POST",
            data: formData,
            success: function(data) {

                if (data.statusCode == 200) {
                    window.location = "/map?kerberos=" + data.user._id;
                } else {
                    errorRedirect(data.message);
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
            data: {kerberos: "changycj"},
            success: function(data) {
                if ( data.statusCode == 200 ) {                
                    window.location = link;
                } else {
                    errorRedirect(data.message);
                }       
            },
            error: errorRedirect
        })

    });

    function errorRedirect(msg) {
        alert("ERROR! " + (msg == undefined ? "" : msg));
        window.location = "/";
    }

});