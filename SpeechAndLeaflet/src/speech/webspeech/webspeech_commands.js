/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////Voice Recognition Part//////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        var recognition = new webkitSpeechRecognition();
        var final_transcript = '';
        var interim_transcript = '';
        var language = 'en-GB'; // TODO: fetch language as option value from drop down box
         // en-GB

        recognition.continuous = true; // keep processing input until stopped
        recognition.interimResults = true; // show interim results
        recognition.lang = language; // specify the language

        recognition.onresult = function (event) {
            // Assemble the transcript from the array of results
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
                $('#transcript').html(final_transcript);
            }

            if (interim_transcript.length > 0) {
                $('#interim').html(interim_transcript);
            }

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

            if ((final_transcript.indexOf("left") >= 0) 
				||(final_transcript.indexOf("net") >= 0)
				||(final_transcript.indexOf("next") >= 0))				{
				centerPoint = map.getCenter();
				var m = (map.getBounds().getEast()- map.getBounds().getWest())/4;
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

            if  ((final_transcript.indexOf("right") >= 0) 
				|| (final_transcript.indexOf("white") >= 0)
				|| (final_transcript.indexOf("fight") >= 0)){
				centerPoint = map.getCenter();
				var m = (map.getBounds().getEast()- map.getBounds().getWest())/4;
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

            if ((final_transcript.indexOf("up") >= 0) 
				|| (final_transcript.indexOf("apple") >= 0)){
                centerPoint = map.getCenter();
				var m = (map.getBounds().getNorth() - map.getBounds().getSouth())/4;
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
				var m = (map.getBounds().getNorth() - map.getBounds().getSouth())/4;
                centerPoint.lat -= m;
                $("#command_animation").html("down").css('fontSize', '13em').animate({
                        'top': '500px'
                    }, 1100,
                    function () {
                        $("#command_animation").html("").css('top', '50%');
                    });
                map.panTo(centerPoint);
                console.log("Panned down by "+ Math.abs(m));
                final_transcript = '';
            }
			
	//////////////////////////////////////////////////////////
	/////Start using leaflets integrated drawing tool/////////
	//////////////////////////////////////////////////////////
			
			
            if (final_transcript.indexOf("point") >= 0) {
                L.marker(map.getCenter()).addTo(map);
                console.log("added marker");
                final_transcript = '';
            }

            if (final_transcript.indexOf("large circle") >= 0) {
                L.circle(map.getCenter(), 400).addTo(map);
                console.log("added large circle");
                final_transcript = '';
            }

            if (final_transcript.indexOf("medium circle") >= 0) {
                L.circle(map.getCenter(), 200).addTo(map);
                console.log("added medium circle");
                final_transcript = '';
            }

            if (final_transcript.indexOf("small circle") >= 0) {
                L.circle(map.getCenter(), 100).addTo(map);
                console.log("added small circle");
                final_transcript = '';
            }

            if (final_transcript.indexOf("large rectangle") >= 0) {
                L.rectangle([[map.getCenter().lat - 0.01, map.getCenter().lng - 0.01],[map.getCenter().lat + 0.01, map.getCenter().lng + 0.01]]).addTo(map);
                console.log("added rectangle");
                final_transcript = '';
            }


            if (final_transcript.indexOf("medium rectangle") >= 0) {
                L.rectangle([[map.getCenter().lat - 0.005, map.getCenter().lng - 0.005],[map.getCenter().lat + 0.005, map.getCenter().lng + 0.005]]).addTo(map);
                console.log("added rectangle");
                final_transcript = '';
            }


            if (final_transcript.indexOf("small rectangle") >= 0) {
                L.rectangle([[map.getCenter().lat - 0.0025, map.getCenter().lng - 0.0025],[map.getCenter().lat + 0.0025, map.getCenter().lng + 0.0025]]).addTo(map);
                console.log("added rectangle");
                final_transcript = '';
            }


	//////////////////////////////////////////////////////////
	/////Start using leaflet plugins//////////////////////////
	//////////////////////////////////////////////////////////
			
			
			
           if (final_transcript.indexOf("show me where i am") >= 0) {
                locater.locate();
                console.log("located user");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("end show me where i am") >= 0) {
                locater.stopLocate();
                console.log("end located user");
                final_transcript = '';
            }

			
            if (final_transcript.indexOf("enable additional information ") >= 0) {
                map.revealOSMControl.activate();
                console.log("enable additional information ");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("disable additional information ") >= 0) {
                map.revealOSMControl.deactivate();
                console.log("disable additional information ");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("go back to home") >= 0) {
                map.setView(new L.LatLng(51.95442, 7.62709), 13);
                console.log("go back to home");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("start measurement") >= 0) {
                map.measureControl.toggle();
                console.log("start measurement");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("end measurement") >= 0) {
                map.measureControl.toggle();
                console.log("end measurement");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("minimize minimap") >= 0) {
                miniMap._minimize();
                console.log("minimize minimap");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("maximize minimap") >= 0) {
                miniMap._restore();
                console.log("maximize minimap");
                final_transcript = '';
            }
			
	//////////////////////////////////////////////////////////
	/////Start using drawing plugin tool//////////////////////
	//////////////////////////////////////////////////////////
			
	if (final_transcript.indexOf("start marker drawing") >= 0) {
                L.Draw.Marker(map).enable();
                console.log("start marker drawing");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("start line drawing") >= 0) {
                L.Draw.Polyline(map).enable();
                console.log("start line drawing");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("start circle drawing") >= 0) {
                L.Draw.Circle(map).enable();
                console.log("start circle drawing");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("start polygon drawing") >= 0) {
               L.Draw.Polygon(map).enable();
                console.log("start polygon drawing");
                final_transcript = '';
            }
            
            
            if (final_transcript.indexOf("start rectangle drawing") >= 0) {
                L.Draw.Rectangle(map).enable();
                console.log("start rectangle drawing");
                final_transcript = '';
            }
        

	//////////////////////////////////////////////////////////
	/////Start using leaflet layer control////////////////////
	//////////////////////////////////////////////////////////
	
	
			if (final_transcript.indexOf("enable temperature map") >= 0) {
                overlayLayers.OpenWeatherMap_Precipitation.onAdd(map);
                console.log("enable temperature map");
                final_transcript = '';
            }
        	
		
		if (final_transcript.indexOf("disable temperature map") >= 0) {
                overlayLayers.OpenWeatherMap_Precipitation.onRemove(map);
                console.log("disable temperature map");
                final_transcript = '';
            }
        }
	
	
	
	
	
