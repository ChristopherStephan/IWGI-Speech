/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////Voice Recognition Part//////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var recognition = new webkitSpeechRecognition();
var recognizing = false;
var final_transcript = '';
var interim_transcript = '';

recognition.lang = "en-US";
recognition.continuous = true; // keep processing input until stopped
recognition.interimResults = true; // show interim results
//recognition.lang = $("#select_language").val(); // specify the language
//console.log("Dialect =" + recognition.lang);
recognition.onresult = function (event) {
    // Assemble the transcript from the array of results
    //recognition.lang = $("#select_language").val(); // specify the language from drop down box
	console.log("Dialect =" + recognition.lang);
	for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript = event.results[i][0].transcript;
        } else {
            interim_transcript = event.results[i][0].transcript;
        }
    }

    console.log("interim: " + interim_transcript);
    console.log("final: " + final_transcript);

    // update the web page
    if (final_transcript.length > 0) {
        $('#transcript').html(capitalize(final_transcript));
        $('#transcriptBubble').html(capitalize(final_transcript));
    }

    if (interim_transcript.length > 0) {
        $('#interim').html(capitalize(interim_transcript));
    }


    if (interim_transcript.length > 0) {
        console.log("Active element:" + document.activeElement.id)
        switch (document.activeElement.id) {

        case "pointname":
            var content = $("#pointname").val();
            $("#pointname").val(capitalize(content.replace(final_transcript, "") + final_transcript));
            final_transcript = "";
            break;

        case "pointdes":
            var content = $("#pointdes").val();
            $("#pointdes").val(capitalize(content.replace(final_transcript, "") + final_transcript));
            final_transcript = "";
            break;

        case "linename":
            var content = $("#linename").val();
            $("#linename").val(capitalize(content.replace(final_transcript, "") + final_transcript));
            final_transcript = "";
            break;

        case "linedes":
            var content = $("#linedes").val();
            $("#linedes").val(capitalize(content.replace(final_transcript, "") + final_transcript));
            final_transcript = "";
            break;

        case "citizenname":
            var content = $("#citizenname").val();
            $("#citizenname").val(capitalize(content.replace(final_transcript, "") + final_transcript));
            final_transcript = "";
            break;

        case "usercomment":
            var content = $("#usercomment").val();
            $("#usercomment").val(capitalize(content.replace(final_transcript, "") + final_transcript));
            final_transcript = "";
            break;
        }
    }

    // no speech commands from the input fields should not trigger map actions
    if (document.activeElement.id != ("usercomment"||"citizenname"||"linedes"||"linename"||"pointdes"||"pointname")) {

    // handling commands

    //////////////////////////////////////////////////////////
    /////Start using navigation controls//////////////////////
    //////////////////////////////////////////////////////////
    if (final_transcript.indexOf("zoom in") >= 0) {
        $("#command_animation").html("zoom in").css({
            'fontSize': '12pt'
        }).animate({
                fontSize: '13em'
            }, 1100,
            function () {
                $("#command_animation").html("");
            });
        map.zoomIn(1);
        console.log("Zoomed in");
        final_transcript = '';
    }

    if (final_transcript.indexOf("zoom out") >= 0) {
        $("#command_animation").html("zoom out").css('fontSize', '13em').animate({
                fontSize: '12pt'
            }, 1100,
            function () {
                $("#command_animation").html("");
            });
        map.zoomOut(1);
        console.log("Zoomed out");
        final_transcript = '';
    }

    if (final_transcript.indexOf("left") >= 0) {
        centerPoint = map.getCenter();
        var m = (map.getBounds().getEast() - map.getBounds().getWest()) / 4;
        centerPoint.lng -= Math.abs(m);
        $("#command_animation").html("left ").css('fontSize', '13em').animate({
                'left': '-500px'
            }, 1100,
            function () {
                $("#command_animation").html("").css('left', '45%');
            });
        map.panTo(centerPoint);
        console.log("Panned Left by " + Math.abs(m));
        final_transcript = '';
    }

    if (final_transcript.indexOf("right") >= 0) {
        centerPoint = map.getCenter();
        var m = (map.getBounds().getEast() - map.getBounds().getWest()) / 4;
        centerPoint.lng += Math.abs(m);
        $("#command_animation").html("right").css({
            'fontSize': '13em'
        }).animate({
                'left': '100%'
            }, 1100,
            function () {
                $("#command_animation").html("").css('left', '45%');
            });
        map.panTo(centerPoint);
        console.log("Panned right by " + Math.abs(m));
        final_transcript = '';
    }

    if (final_transcript.indexOf("up") >= 0) {
        centerPoint = map.getCenter();
        var m = (map.getBounds().getNorth() - map.getBounds().getSouth()) / 4;
        centerPoint.lat += m;
        $("#command_animation").html("up").css('fontSize', '13em').animate({
                'top': '-250px'
            }, 1100,
            function () {
                $("#command_animation").html("").css('top', '50%');
            });
        map.panTo(centerPoint);
        console.log("Panned up by " + Math.abs(m));
        final_transcript = '';
    }

    if (final_transcript.indexOf("down") >= 0) {
        centerPoint = map.getCenter();
        var m = (map.getBounds().getNorth() - map.getBounds().getSouth()) / 4;
        centerPoint.lat -= m;
        $("#command_animation").html("down").css('fontSize', '13em').animate({
                'top': '500px'
            }, 1100,
            function () {
                $("#command_animation").html("").css('top', '50%');
            });
        map.panTo(centerPoint);
        console.log("Panned down by " + Math.abs(m));
        final_transcript = '';
    }

    //////////////////////////////////////////////////////////
    /////Start using leaflets integrated drawing tool/////////
    //////////////////////////////////////////////////////////


    if (final_transcript.indexOf("place marker") >= 0) {
        L.marker(map.getCenter()).addTo(map);
        console.log("place marker");
        final_transcript = '';
    }

    if (final_transcript.indexOf("place large circle") >= 0) {
        L.circle(map.getCenter(), 400).addTo(map);
        console.log("place large circle");
        final_transcript = '';
    }

    if (final_transcript.indexOf("place medium circle") >= 0) {
        L.circle(map.getCenter(), 200).addTo(map);
        console.log("place medium circle");
        final_transcript = '';
    }

    if (final_transcript.indexOf("place small circle") >= 0) {
        L.circle(map.getCenter(), 100).addTo(map);
        console.log("place small circle");
        final_transcript = '';
    }

    if (final_transcript.indexOf("place large rectangle") >= 0) {
        L.rectangle([
            [map.getCenter().lat - 0.01, map.getCenter().lng - 0.01],
            [map.getCenter().lat + 0.01, map.getCenter().lng + 0.01]
        ]).addTo(map);
        console.log("place large rectangle");
        final_transcript = '';
    }


    if (final_transcript.indexOf("place medium rectangle") >= 0) {
        L.rectangle([
            [map.getCenter().lat - 0.005, map.getCenter().lng - 0.005],
            [map.getCenter().lat + 0.005, map.getCenter().lng + 0.005]
        ]).addTo(map);
        console.log("place medium rectangle");
        final_transcript = '';
    }


    if (final_transcript.indexOf("place small rectangle") >= 0) {
        L.rectangle([
            [map.getCenter().lat - 0.0025, map.getCenter().lng - 0.0025],
            [map.getCenter().lat + 0.0025, map.getCenter().lng + 0.0025]
        ]).addTo(map);
        console.log("place small rectangle");
        final_transcript = '';
    }


    //////////////////////////////////////////////////////////
    /////Start using leaflet plugins//////////////////////////
    //////////////////////////////////////////////////////////



    if (final_transcript.indexOf("enable location") >= 0) {
        locater.locate();
        console.log("enable location");
        final_transcript = '';
    }


    if (final_transcript.indexOf("disable location") >= 0) {
        locater.stopLocate();
        console.log("end location");
        final_transcript = '';
    }


    if (final_transcript.indexOf("enable information") >= 0) {
        map.revealOSMControl.activate();
        console.log("enable information");
        final_transcript = '';
    }


    if (final_transcript.indexOf("disable information") >= 0) {
        map.revealOSMControl.deactivate();
        console.log("disable information");
        final_transcript = '';
    }


    if (final_transcript.indexOf("back to home") >= 0) {
        map.setView(new L.LatLng(51.95442, 7.62709), 13);
        console.log("back to home");
        final_transcript = '';
    }


    if (final_transcript.indexOf("enable measurement") >= 0) {
        map.measureControl.toggle();
        console.log("enable measurement");
        final_transcript = '';
    }


    if (final_transcript.indexOf("disable measurement") >= 0) {
        map.measureControl.toggle();
        console.log("disable measurement");
        final_transcript = '';
    }

    if (final_transcript.indexOf("enable mini map") >= 0) {
        miniMap._restore();
        console.log("enable mini map");
        final_transcript = '';
    }

    if (final_transcript.indexOf("disable minimap") >= 0) {
        miniMap._minimize();
        console.log("disable mini map");
        final_transcript = '';
    }


    //////////////////////////////////////////////////////////
    /////Start using drawing plugin tool//////////////////////
    //////////////////////////////////////////////////////////

    if (final_transcript.indexOf("point project") >= 0) {
        new L.Draw.Marker(map).enable();
        //or this way: L.Draw.Marker(map, drawControl.options.marker).enable();    https://github.com/Leaflet/Leaflet.draw/issues/179#issuecomment-26500042
        console.log("point project");
        final_transcript = '';
    }


    if (final_transcript.indexOf("street project") >= 0) {
        new L.Draw.Polyline(map).enable();
        console.log("street project");
        final_transcript = '';
    }



    //////////////////////////////////////////////////////////
    /////Start using leaflet layer control////////////////////
    //////////////////////////////////////////////////////////


    if (final_transcript.indexOf("start temperature map") >= 0) {
        overlayLayers.OpenWeatherMap_Precipitation.onAdd(map);
        console.log("start temperature map");
        final_transcript = '';
    }


    if (final_transcript.indexOf("end temperature map") >= 0) {
        overlayLayers.OpenWeatherMap_Precipitation.onRemove(map);
        console.log("end temperature map");
        final_transcript = '';
    }


    //////////////////////////////////////////////////////////
    /////Set Focus to the necessary input fields//////////////
    //////////////////////////////////////////////////////////

    //Focus to search bar
    if (final_transcript.indexOf("focus search bar") >= 0) {
        setFocusToSearchBar();
        console.log("focus search bar");
        final_transcript = '';
    }

    //////////////////////////////////////////////////////////
    /////Controlling the UserCommenting Function//////////////
    //////////////////////////////////////////////////////////

    //Focus to User Name Box
    if (final_transcript.indexOf("focus username") >= 0) {
        setFocusToCitizenName();
        console.log("focus username");
        final_transcript = '';
    }

    //Focus to UserComment Box
    if (final_transcript.indexOf("focus input") >= 0) {
        setFocusToUserComment();
        console.log("focus input");
        final_transcript = '';
    }

    //Send UserComment
    if (final_transcript.indexOf("submit input") >= 0) {
        sendUserComments();
        console.log("submit input");
        final_transcript = '';
    }

    //Clear the form
    if (final_transcript.indexOf("clear form") >= 0) {
        clearForm();
        console.log("clear form");
        final_transcript = '';
    }
    }
}

recognition.onend = function() {
    recognizing = false;
    document.getElementById("speech").src = "red_circle.png";
    // automatically restart the speech recognition in case it stops
    recognition.start();
    
    /*
    //used for manual restart via click on icon
    $("#speech").click(function() {
        recognition.start();
    });
    */
}

recognition.onstart = function() {
    recognizing = true;
    document.getElementById("speech").src = "green_circle.png";
}

recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
        document.getElementById("speech").src = "red_circle.png";
        console.log("Error: No speech.")
      
    }
    
    if (event.error == 'audio-capture') {
        document.getElementById("speech").src = "red_circle.png";
        console.log("Error: No Microphone.")
    }
  };

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}