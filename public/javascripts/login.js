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
                window.location = "/map?kerberos=" + data;
            }
        });
    });

});