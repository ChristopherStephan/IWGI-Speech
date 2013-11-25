function Editing()
{
// to add

}


function confirmation(id)
{
var ID=id
var x;
var r=confirm("Are You Sure to Delete the Point ? ");
if (r==true)
  {
  deleting(ID);
  }
else
  {
// to not delete the function

  }
//document.getElementById("demo").innerHTML=x;
}

var lastID;
function addPoint(){
	function onMapClick(e) {
		var marker = L.marker();
		var pointname= prompt("Please Enter Point Name: ","");
		
		
		marker
				.setLatLng(e.latlng,{draggable:'true'})
				.setIcon(icon)				
				.addTo(map)
		marker.dragging.enable();
		var container = $('<div />');
		var coordinates = marker.toGeoJSON().geometry.coordinates;
		var coord=coordinates.toString();
	lastID=(lastID+1);
	
		// 2 options to call the edit function, option 1: using prompt window ,, option 2 : using new form window .... option 1 is disactivated,, option 2 acitivated
	//container.html('Coordination of Point Name: <br> ('+ coord+') <br>'+"<a href='#' font-size=30 > Website</a>"+ '&#09' +"<a href='#' font-size=30  onClick='confirmation()'> Delete</a>"+ '&#09' +"<a href='#' onClick=Editing() font-size=30 >  Edit</a>" );
	container.html('Coordination of '+pointname +' is: <br> ('+ coord+') <br>'+"<a href='#' font-size=30 > Website</a>"+ '&#09' +"<button type='button' onclick='deleting("+lastID+''+")' style='align:left;'>Delete</button>"+ '&#09' +"<a href='#' onClick=window.open('editform.html','mywindow','width=400,height=250,left=200,top=100') font-size=30 >  Edit</a>" );
	
   marker.bindPopup(container[0]);
   save(pointname,"Description","{Comment1,Comment2}",coordinates,1);
			
	map.off('click', onMapClick);				
	}
	map.on('click', onMapClick);	
};

var icon = L.icon({
    iconUrl: 'punkt.png',
    iconSize:     [20, 20], // size of the icon
});

function save(name,des,com,coordinates){
	$.post(
		"database_insert.php?",
		{	
		Name:name,
		Description:des,
		Comments:com,
		Coordinates:coordinates
		},
		function(){callPoints()}	
		);		
}

function deleting(id){
$.post("database_delete.php?",
		{ID: id},
		function(){javascript:location.reload()}
		);
}

function callPoints(){
var xmlhttp;
if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  }
else
  {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.onreadystatechange=function()
  {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
	//document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
	var obj = jQuery.parseJSON(xmlhttp.responseText);
    for(var i in obj)
	{
		var coordinates = obj[i].Coord.split(',');
	
		var marker = L.marker(new L.LatLng(parseFloat(coordinates[0]), parseFloat(coordinates[1])),options={"id":obj[i].ID});		
		marker
		
			.setIcon(icon)				
			.addTo(map)
		var container = $('<div />');	
	  		container.html('Coordination of '+obj[i].Name+' is: <br> '+obj[i].Coord+' <br>'+' Description: <br> '+obj[i].Description+' <br>'+"<a href='#' font-size=30 > Website</a>"+ '&#09' +"<button type='button' onclick='confirmation("+obj[i].ID+")' style='align:left;'>Delete</button>"+ '&#09' +"<a href='#' onClick=window.open('editform.html','mywindow','width=400,height=250,left=200,top=100') font-size=30 >  Edit</a>");
			marker.bindPopup(container[0]);
		lastID=parseInt(obj[i].ID);
		
	}
	//document.getElementById("myDiv").innerHTML=obj;
    }
  }
  //If data needs to be processed, "Post"
	xmlhttp.open("GET","database_select.php",true);
	xmlhttp.send();
}


function up(){
var latln=marker.getLatLng();
var hoeher=latln.lat+0.001;
marker.setLatLng(new L.LatLng(hoeher,latln.lng));
}
function down(){
var latln=marker.getLatLng();
var runter=latln.lat-0.001;
marker.setLatLng(new L.LatLng(runter,latln.lng));
}
function right(){
var latln=marker.getLatLng();
var rechts=latln.lng+0.001;
marker.setLatLng(new L.LatLng(latln.lat,rechts));
}
function left(){
var latln=marker.getLatLng();
var links=latln.lng-0.001;
marker.setLatLng(new L.LatLng(latln.lat,links));
}
function mapup(){
map.panBy([0, -50]);
}
function mapdown(){
map.panBy([0, +50]);
}
function mapleft(){
map.panBy([-50, 0]);
}
function mapright(){
//map.panTo([51.95,7.6197]);
map.panBy([50, 0]);
}
