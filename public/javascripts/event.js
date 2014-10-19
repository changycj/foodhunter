$(document).ready(function() {

    var event_id = window.location.search.split("id=")[1];

    $.ajax({
        url: "/events/" + event_id,
        method: "GET",
        success: function(event) {
            $("input[name='date']").datepicker();
            $("input[name='date']").datepicker("setDate", new Date(event.when.start));

            $("input[name^='time']").timepicker();
            $("input[name='time_start']").timepicker("setTime", new Date(event.when.start));
            $("input[name='time_end']").timepicker("setTime", new Date(event.when.end));

            $("span[name='host']").text(event.host);

            $("textarea[name='description']").text(event.description);

            $.ajax({
                url: "/locations/" + event.location,
                method: "GET",
                success: function(loc) {
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
                            url: "/events/" + event._id,
                            type: "PUT",
                            data: formData,
                            cache: false,
                            success: function(data) {
                                alert("success! " + JSON.stringify(data));
                            }

                        });                 
                    });

                    // close form
                    $("input[name='close']").click(function(e) {
                        e.preventDefault();
                        window.close();
                    });
                }
            })

        }
    });



});