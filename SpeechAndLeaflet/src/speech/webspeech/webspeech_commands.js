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
            $("#pointname").val(capitalize(final_transcript));
            final_transcript = "";
            break;

        case "pointdes":
            var content = $("#pointdes").val();
            $("#pointdes").val(capitalize(content.replace(final_transcript, "") + final_transcript));
            final_transcript = "";
            break;

        case "linename":
            var content = $("#linename").val();
            $("#linename").val(capitalize(final_transcript));
            final_transcript = "";
            break;

        case "linedes":
            var content = $("#linedes").val();
            $("#linedes").val(capitalize(content.replace(final_transcript, "") + final_transcript));
            final_transcript = "";
            break;

        case "citizenname":
            var content = $("#citizenname").val();
            $("#citizenname").val(capitalize(final_transcript));
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

    if (final_transcript.indexOf("enable minimap") >= 0) {
        miniMap._restore();
        console.log("enable minimap");
        final_transcript = '';
    }

    if (final_transcript.indexOf("disable minimap") >= 0) {
        miniMap._minimize();
        console.log("disable minimap");
        final_transcript = '';
    }


    //////////////////////////////////////////////////////////
    /////Start using drawing plugin tool//////////////////////
    //////////////////////////////////////////////////////////

    if (final_transcript.indexOf("place project") >= 0) {
        new L.Draw.Marker(map).enable();
        //or this way: L.Draw.Marker(map, drawControl.options.marker).enable();    https://github.com/Leaflet/Leaflet.draw/issues/179#issuecomment-26500042
        console.log("place project");
        final_transcript = '';
    }


    if (final_transcript.indexOf("Street project") >= 0) {
        new L.Draw.Polyline(map).enable();
        console.log("Street project");
        final_transcript = '';
    }



    //////////////////////////////////////////////////////////
    /////Start using leaflet layer control////////////////////
    //////////////////////////////////////////////////////////


    if (final_transcript.indexOf("enable noise map") >= 0) {
        laerm24.onAdd(map);
        console.log("enable noise map");
        final_transcript = '';
    }


    if (final_transcript.indexOf("disable noise map") >= 0) {
        laerm24.onRemove(map);
        console.log("disable noise map");
        final_transcript = '';
    }
	
	
	if (final_transcript.indexOf("enabling bicycle map") >= 0) {
        osmCycle.onAdd(map);
        console.log("enabling bicycle map");
        final_transcript = '';
    }


    if (final_transcript.indexOf("disable bicycle map") >= 0) {
        osmCycle.onRemove(map);
        console.log("disable bicycle map");
        final_transcript = '';
    }
	

	
	// some other layers, which can be used: osmcyle, layerDGK5, layerDTK10, layerOrtho, rain,wind, laerm_24

	


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

    //Focus to Userremark Box
    if (final_transcript.indexOf("focus remark") >= 0) {
        setFocusToUserComment();
        console.log("focus remark");
        final_transcript = '';
    }

    //Send Userremark
    if (final_transcript.indexOf("send remark") >= 0) {
        sendUserComments();
        console.log("send remark");
        final_transcript = '';
    }

    //Clear the form
    if (final_transcript.indexOf("clear form") >= 0) {
        clearForm();
        console.log("clear form");
        final_transcript = '';
    }
    

	
	 //////////////////////////////////////////////////////////
     /////Controlling the Point Function///////////////////////
     //////////////////////////////////////////////////////////

	//Focus to Point Name Box
    if (final_transcript.indexOf("focus point name") >= 0) {
        setFocusToPointName();
        console.log("focus point name");
        final_transcript = '';
    }
	
	
	//Focus to Point Description Box
    if (final_transcript.indexOf("focus point description") >= 0) {
        setFocusToPointDes();
        console.log("focus point description");
        final_transcript = '';
    }
	

	//Submit Point
    if (final_transcript.indexOf("send Point") >= 0) {
        addPointButton();
        console.log("send Point");
        final_transcript = '';
    }
	
	
	
	
	//////////////////////////////////////////////////////////
    /////Controlling the street Function///////////////////////
    //////////////////////////////////////////////////////////

	//Focus to street Name Box
    if (final_transcript.indexOf("focus street name") >= 0) {
        setFocusToLineName();
        console.log("focus street name");
        final_transcript = '';
    }
	
	
	//Focus to street Description Box
    if (final_transcript.indexOf("focus Street description") >= 0) {
        setFocusToLineDes();
        console.log("focus Street description");
        final_transcript = '';
    }
	
	
	//Select Planned Street
    if (final_transcript.indexOf("select real street") >= 0) {
        selectPlannedRoad();
        console.log("select real street");
        final_transcript = '';
    }
	
	
	//Select Alternative Street
    if (final_transcript.indexOf("select alternative Street") >= 0) {
        selectAlternativeRoad();
        console.log("select alternative Street");
        final_transcript = '';
    }
	

	//Submit street
    if (final_transcript.indexOf("send Street") >= 0) {
        addLineButton();
        console.log("send Street");
        final_transcript = '';
    }
	
	
	
	//////////////////////////////////////////////////////////
    /////Controlling the Clear Function/////////////////////
    //////////////////////////////////////////////////////////
	

	//Clear Form
    if (final_transcript.indexOf("delete project") >= 0) {
        clearForm();
        console.log("delete project");
        final_transcript = '';
    }
	
	
	//////////////////////////////////////////////////////////
    /////Show additional information (help,projects)//////////
    //////////////////////////////////////////////////////////
	

	//Enable help
    if (final_transcript.indexOf("enable help") >= 0) {
        speechbar.showDialog();
        console.log("enable help");
        final_transcript = '';
    }
	
	//Disable help
    if (final_transcript.indexOf("disable help") >= 0) {
        speechbar.hideDialog();
        console.log("disable help");
        final_transcript = '';
    }
	
	//Enable Projectbar
    if (final_transcript.indexOf("enable projects ") >= 0) {
        showProjectSidebar(); //check customFunction.js
        console.log("enable projects ");
        final_transcript = '';
    }
	
	//Disable Projectbar
    if (final_transcript.indexOf("disable projects") >= 0) {
        sidebarProjects.hide(); //check customFunction.js
        console.log("disable projects");
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
