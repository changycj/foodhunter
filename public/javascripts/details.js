// Lead: Judy Chang
// 
// Specific event popup
$(document).ready(function() {

    // event ID
    var event_id = window.location.search.split("id=")[1];

    // get event info
    $.ajax({
        url: "/api/events/" + event_id,
        method: "GET",
        success: function(data) {
            if (data.success == 1) {
                var event = data.event;

                // add UI widgets and populate with data
                $("input[name='date']").datepicker();
                $("input[name='date']").datepicker("setDate", new Date(event.when.start));

                $("input[name^='time']").timepicker();
                $("input[name='time_start']").timepicker("setTime", new Date(event.when.start));
                $("input[name='time_end']").timepicker("setTime", new Date(event.when.end));

                $("span[name='host']").text(event.host);

                $("textarea[name='description']").text(event.description);

                //get location data
                $.ajax({
                    url: "/api/locations/" + event.location,
                    method: "GET",
                    success: function(data) {

                        if (data.success == 1) {
                            var loc = data.location;
                            
                            $("span[name='location']").text(loc.building + " - " + loc.name);


                            // form submit
                            $("input[name='submit']").click(function(e) {
                                e.preventDefault();

                                var date  = $("input[name='date']").datepicker("getDate");
                                var time_start = $("input[name='time_start']").timepicker("getTime", date);
                                var time_end = $("input[name='time_end']").timepicker("getTime", date);

                                // event data
                                var formData = {
                                    when: {
                                        start: time_start.valueOf(),
                                        end: time_end.valueOf()
                                    },
                                    description: $("textarea[name='description']").val(),
                                    location: $("select[name='location'] option:selected").val()
                                };

                                // PUT to update event
                                $.ajax({
                                    url: "/api/events/" + event._id,
                                    type: "PUT",
                                    data: formData,
                                    cache: false,
                                    success: function(data) {
                                        if (data.success == 1) {

                                            // there is probably a better way than refresh
                                            // currently refresh to reflect on main page
                                            window.opener.location.reload();
                                            // close popup
                                            window.close();
                                        } else {
                                            errorRedirect();
                                        }
                                    },
                                    error: errorRedirect

                                });                 
                            });
                        } else {
                            errorRedirect();
                        }

                        // close popup
                        $("input[name='close']").click(function(e) {
                            e.preventDefault();
                            window.close();
                        });
                    },
                    error: errorRedirect
                });
            } else {
                errorRedirect();
            }

        },
        error: errorRedirect
    });

    function errorRedirect() {
        alert("ERROR!");
        window.location = "/";
    }


});