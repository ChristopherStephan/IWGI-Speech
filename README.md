## IWGI - Interaction with Geographic Information ##
### Speech And Leaflet ###
----------
![Speech][1]        ![enter image description here][2]   ![enter image description here][3]

To test it, you need to run the .html site within a web server like apache or tomcat. For an easy installation you could use packages like XAMPP. 

 1. Clone the repository 
 2. Copy all files to the htcdocs of your installed webserver. 
 3. Browse the site with Google Chrome. Other Browser are not supported, because the application uses heavily Googles WebSpeech API, which only works with Google Chrome. We're currently investigating other options using PocketSphinx or other libs.
 4. To start interacting with the map by speech, first click the green button, allow microphone access from browser. There you have the following options:

 - Basic Map Navigation Zoom
     - **"Zoom out"**, 
     - **"Zoom in"**
 - Basic Map Navigation Pan
     - **"Up"**, 
     - **"Down"**,
     - **"Left"**, 
     - **"Right"** 
 - Place fixed-scale geometry objects on the map
     - **"Point"**, 
     - **"Large/medium/small circle"**,
     - **"Large/medium/small rectangle"**
 - Control the drawing control plugin (enable drawing functionalities)
     - **"Draw marker"**,
     - **"Draw line"**,
     - **"Draw circle"**, 
     - **"Draw polyline"**, 
     - **"Draw rectangle"** 
 - Locate yourself using the Geolocate Tool
     - **"Start location"**,
     - **"End location"**  
 - To control the Reveal OSM Plugin, which provides additional information via OSM features say:
     - **"Start information"**,
     - **"End information"** 
 - To switch back to the home extend (Münster): 
     - **"Back to home"** 
 - To Enable or Disable the measurement tool, say
     - **"Start measurement"**,
     - **"End measurement"**
 - To control the minimap.
     - **"Start minimap"**,
     - **"End minimap"**
 - To enable a temperature layer. More layers will follow
     - **"Start temperature map"**,
     - **"End temperature map"**
 - Set focus in the search bar
     - **"Focus search bar"**
 - Set focus in the name box
     - **"Focus username"**
 - Set focus in the user comment box
     - **"Focus input"**
- Submit user comment
     - **"Submit input"**
- Clear the form
     - **"Clear form"**
- Place a street project
     - **"Place street project"**
     
- Place a point project
     - **"Place point project"**
     

----------
To-DOs

 - Issue list: https://github.com/ChristopherStephan/IWGI-Speech/issues
 - Mainly: 
     - Sphinx Integration (closed), 
     - Timeout for WebSpeech API
     - Gesture Integration
     - Backend Stuff


  [1]: http://megaicons.net/static/img/icons_sizes/8/60/96/basic-speech-bubble-icon.png
  [2]: http://www.ipart.nsw.gov.au/files/1/209/plus-sign.jpg
  [3]: http://leafletjs.com/docs/images/logo.png
