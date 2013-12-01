<?php
$dbconn = pg_connect("host=localhost port=5432 dbname=features_iwgi user=postgres password=admin123")
    or die('Verbindungsaufbau fehlgeschlagen: ' . pg_last_error());
	$ID = $_POST['ID'];
  //$query=pg_query($dbconn,"Insert into \"Feature\" values (42,'test','bla','{eins,zwei}','51.1234,7.12345');");
	$query=pg_query($dbconn,'Delete from "Feature" where "ID"='.$ID.';');
?>
