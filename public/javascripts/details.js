$(document).ready(function() {

    var event_id = window.location.search.split("id=")[1];

    $.ajax({
        url: "/api/events/" + event_id,
        method: "GET",
        success: function(data) {
            if (data.success == 1) {
                var event = data.event;

                $("input[name='date']").datepicker();
                $("input[name='date']").datepicker("setDate", new Date(event.when.start));

                $("input[name^='time']").timepicker();
                $("input[name='time_start']").timepicker("setTime", new Date(event.when.start));
                $("input[name='time_end']").timepicker("setTime", new Date(event.when.end));

                $("span[name='host']").text(event.host);

                $("textarea[name='description']").text(event.description);

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

                                var formData = {
                                    when: {
                                        start: time_start.valueOf(),
                                        end: time_end.valueOf()
                                    },
                                    description: $("textarea[name='description']").val(),
                                    location: $("select[name='location'] option:selected").val()
                                };

                                $.ajax({
                                    url: "/api/events/" + event._id,
                                    type: "PUT",
                                    data: formData,
                                    cache: false,
                                    success: function(data) {
                                        if (data.success == 1) {
                                        // there is probably a better than refresh
                                            window.opener.location.reload();
                                            window.close();
                                        } else {
                                            alert("ERROR!");
                                        }
                                    }

                                });                 
                            });
                        } else {
                            alert("ERROR!");
                        }

                        // close form
                        $("input[name='close']").click(function(e) {
                            e.preventDefault();
                            window.close();
                        });
                    }
                });
            } else {
                alert("ERROR!");
            }

        }
    });



});