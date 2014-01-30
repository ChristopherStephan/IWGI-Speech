## IWGI - Interaction with Geographic Information ##
### Speech And Leaflet ###
----------
![Speech][1]        ![enter image description here][2]   ![enter image description here][3]

To test it, you need to run the .html site within a web server like apache or tomcat. For an easy installation you could use packages like XAMPP. 

 1. Clone the repository 
 2. Copy all files to the htcdocs of your installed webserver. 
 3. Browse the site with Google Chrome. Other Browser are not supported, because the application uses heavily Googles WebSpeech API, which only works with Google Chrome. We're currently investigating other options using PocketSphinx or other libs.
 4. To start interacting with the map by speech, first click the green button, allow microphone access from browser. There you have the following options:

----------

Speech
------

 - Basic Map Navigation Zoom
     - **"Zoom out"**, 
     - **"Zoom in"**
 - Basic Map Navigation Pan
     - **"Up"**, 
     - **"Down"**,
     - **"Left"**, 
     - **"Right"** 
 - Place a street project
     - **"Street project"**
 - Place a point project
     - **"Place project"**
 - Locate yourself using the Geolocate Tool
     - **"Enable location"**,
     - **"Disable location"**  
 - To control the Reveal OSM Plugin, which provides additional information via OSM features say:
     - **"Enable information"**,
     - **"Disable information"** 
 - To switch back to the home extend (Münster): 
     - **"Back to home"** 
 - To Enable or Disable the measurement tool, say
     - **"Enable measurement"**,
     - **"Disable measurement"**
 - To control the minimap.
     - **"Enable minimap"**,
     - **"Disable minimap"**
 - To enable a temperature layer. More layers will follow
     - **"Enable temperature map"**,
     - **"Disable temperature map"**

To set the focus to different input fields (search bar)
 - Set focus in the search bar
     - **"Focus search bar"**


----------


To set the focus to different input fields (**Comment** function)
 - Set focus in the name box of the Comment function
     - **"Focus username"**
 - Set focus in the user comment box in the Comment function
     - **"Focus remark"**
 - Submit user comment in the Comment Function
     - **"Submit remark"**
 - Clear the form
     - **"Clear form"**


----------


To set the focus to different input fields (**Point** project function)
 - Set focus in the point name box of the PointProject function
     - **"Focus Point Name"**
 - Set focus in the point description box of the PointProject function
     - **"Focus Point Description"**
 - Submit point project in the PointProject Function
     - **"Send Point"**
 - Clear the form
     - **"Clear form"**


----------


To set the focus to different input fields (**Line** project function)
 - Set focus in the street name box of the LineProject function
     - **"Focus Street Name"**
 - Set focus in the street description box of the LineProject function
     - **"Focus Street Description"**
 - Select "Planned Street" option of the LineProject function
     - **"Select Real Street"**
 - Select "Alternative Street" option of the LineProject function
     - **"Select Alternative Street"**
 - Submit street project in the LineProject Function
     - **"Send Street"**
 - Clear the form
     - **"Clear form"**

----------
Gesture
-------
**How to run**

 - Run the GRT_Predict.exe -file with your Kinect connected 
 - If you use Microsoft Kinect for windows, you will have to install an additional driver (SDK): http://www.microsoft.com/en-us/kinectforwindowsdev/Downloads.aspx
 - To Initialize hands, wave your right hand first, than wave your left and than.  
 - If your hands get lost, put them down and wait for 15 seconds or so. Than repeat the procedure.

**Gestures and functionality**
 - grab with left hand (grab gesture) --> left mouse down release left
 - hand (release gesture) --> left mouse up 
 - click with any hand (push your hand/arm/fingertips forward) --> +-key 
 - grab with left hand and click with the other hand --> -key
 - --> How to pan: grab with your left hand, then pan with your right hand whereas your left hand stays still
 - --> How to zoom in: "click" with one of your hands 
 - --> How to zoom out: "click" with your right hand while holding the grab position with your left hand
   
**Shortcuts for lost and found hands:** 
 - ctrl + shift + F1: found right hand 
 - ctrl + shift + , (comma): lost   
 - right hand ctrl + shift + l is now: lost 
 - left hand ctrl + shift + k is now: found left hand

     

----------
To-DOs

 - Issue list: https://github.com/ChristopherStephan/IWGI-Speech/issues


  [1]: http://megaicons.net/static/img/icons_sizes/8/60/96/basic-speech-bubble-icon.png
  [2]: http://www.ipart.nsw.gov.au/files/1/209/plus-sign.jpg
  [3]: http://leafletjs.com/docs/images/logo.png
