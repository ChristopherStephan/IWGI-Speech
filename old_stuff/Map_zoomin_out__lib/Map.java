import javax.swing.JFrame;

import org.jdesktop.swingx.JXMapKit;
import org.jdesktop.swingx.JXMapKit.DefaultProviders;
import org.jdesktop.swingx.mapviewer.GeoPosition;

import edu.cmu.sphinx.demo.helloworld.HelloWorld;
import edu.cmu.sphinx.frontend.util.Microphone;
import edu.cmu.sphinx.recognizer.Recognizer;
import edu.cmu.sphinx.result.Result;
import edu.cmu.sphinx.util.props.ConfigurationManager;


public class Map {
	public static void main (String args[]){
		JFrame frame =new JFrame("");
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		
	final JXMapKit map=new JXMapKit();
	map.setDefaultProvider(DefaultProviders.OpenStreetMaps);
	map.setAddressLocation(new GeoPosition (51.96,7.59));
	map.setZoom(2);
	frame.add(map);
	frame.setBounds(100,100,400,400);
	frame.setVisible(true);


	ConfigurationManager cm;

	if (args.length > 0) {
	    cm = new ConfigurationManager(args[0]);
	} else {
	    cm = new ConfigurationManager(HelloWorld.class.getResource("helloworld.config.xml"));
	}

	Recognizer recognizer = (Recognizer) cm.lookup("recognizer");
	recognizer.allocate();

	// start the microphone or exit if the program if this is not possible
	Microphone microphone = (Microphone) cm.lookup("microphone");
	if (!microphone.startRecording()) {
	    System.out.println("Cannot start microphone.");
	    recognizer.deallocate();
	    System.exit(1);
	}
	int x = 2;
	System.out.println("Say: Zoom) ( In| Out)");

	// loop the recognition until the programm exits.
	while (true) {
	    System.out.println("Start speaking. Press Ctrl-C to quit.\n");

	    Result result = recognizer.recognize();
	   
	    if (result != null) {
	        String resultText = result.getBestFinalResultNoFiller();
	        System.out.println("You said: " + resultText + '\n');
	        
	        	if (resultText.compareTo("zoom out") == 0){
	        		x=x+1;
	        		map.setZoom(x);
	        	
	        	}
	        	
	        	if (resultText.compareTo("zoom in") == 0){
	        		x=x-1;
	        		map.setZoom(x );
	        	
	        	}
	    } else {
	        System.out.println("I can't hear what you said.\n");
	    }
	}
	}

}
