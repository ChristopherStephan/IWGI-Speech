<?php
$dbconn = pg_connect("host=localhost port=5432 dbname=features_iwgi user=postgres password=admin123")
    or die('Verbindungsaufbau fehlgeschlagen: ' . pg_last_error());
	
	
	$Name = $_POST['Name'];
	$Description = $_POST['Description'];
	$Comments = $_POST['Comments'];
	$LatLng = $_POST['Coordinates'];
	

  //$query=pg_query($dbconn,"Insert into \"Feature\" values (42,'test','bla','{eins,zwei}','51.1234,7.12345');");
	$query=pg_query($dbconn,"Insert into \"Feature\" values (DEFAULT,'".$Name."','".$Description."','{}','".$LatLng[1].",".$LatLng[0]."');");
	
	
?>
