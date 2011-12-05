// Set to 6.0 scripting object model (Indesign CS4)app.scriptPreferences.version = 6.0;




main();function main() {	breakColumns();}function getSelectedTextFrame(){	if( app.selection[0] == null )		return null;			if( app.selection[0].parent.constructor.name == "Story" ) 		return app.selection[0].parentTextFrames;	if( app.selection[0].constructor.name == "TextFrame" )		return app.selection[0];	return null;}function breakColumns(){	if (!isValidContext()) error_exit ("Something's wrong.  Fix it and try again.  Sorry for the vague error message.");	// Get the current text frame. Should never fail since we validated the context before.	// An error here is most likely caused by a bug in isValidContext().	var tf = getSelectedTextFrame();					var clmwidth  =  tf.textFramePreferences.textColumnFixedWidth;	var spclm     =  tf.textFramePreferences.textColumnGutter ;//	var clmwidth  = Math.round( tf.textFramePreferences.textColumnFixedWidth * 100 ) / 100;//	var spclm     = Math.round( tf.textFramePreferences.textColumnGutter     * 100 ) / 100;	var clmnb     = tf.textColumns.length;	var tfpos     = tf.geometricBounds;	var tfwh      = tf.geometricBounds[3] - tf.geometricBounds[1];	var contenttf = tf.contents;		var prev_frame  = tf;		for( i = 0; i < clmnb; i++ )	{		// Calculate the bounds for the new text frame		var y1 = tfpos[ 0 ];		var x1 = tfpos[ 1 ] + i * ( clmwidth + spclm );		var y2 = tfpos[ 2 ];		var x2 = x1 + clmwidth;		
		// Make a new text frame with identical attributes		var ntf = tf.duplicate();				// Remove the content
		ntf.contents = "";				// Set the column count to one		ntf.textFramePreferences.textColumnCount = 1;				// Size and position it like the original column		ntf.geometricBounds = [ y1, x1, y2, x2 ];								// Link the frame to the previous one. The first one		// is linked to the original frame, thus maintaining		// correct links to an InCopy story if the frame was		// an InCopy assigned frame.		prev_frame.nextTextFrame = ntf;				// This is going to be threaded to the next frame		// we are going to generate		prev_frame = ntf;	}	// Delete the original text frame	tf.remove();}function isValidContext(){	// We need an active document	if( app.documents.length == 0 )		error_exit ("Please open a document and try again.");			// We need a selection for this to work	if( app.selection.length == 0 )		error_exit ("Please select a text frame and try again.");		// We can only operate on a text frame	if( app.selection[0].parent.constructor.name != "Story" && app.selection[0].constructor.name != "TextFrame" )		error_exit ("Please select a text frame and try again.");	var tf = getSelectedTextFrame();		// We need a valid frame selection	if( tf == null )		error_exit ("Please select a valid text frame and try again.");	// We can't work on a locked frame. We could theoretically unlock	// and then relock the frame, but that would kind of defeat the purpose	// of letting the user lock a frame. The command being greyed out 	// is more like what a user would expect, even though InDesign lets 	// users change the number of columns on a locked frame.	if( tf.locked == true )		error_exit ("Please unlock the text frame and try again.");
		
	// The story has to be checked out.
	if (tf.parentStory.lockState == LockStateValues.CHECKED_IN_STORY)
		error_exit ("Please check out the story in this text frame and try again.");
	
	// The story can't be checked out by someone else.	
	if (tf.parentStory.lockState == LockStateValues.LOCKED_STORY)
	  error_exit ("The story in this text frame is checked out by someone else.  You have to have it " +
	  						"checked out yourself to run this script.");
	  						
	// We need more than one column.	if( tf.textColumns.length < 2 )		error_exit ("Please select a text frame containing more than one column and try again.");
		
	if( tf.parentStory.overflows )
		error_exit ("The text in this frame overflows.  Please create an overflow box for it and try again.");			// Everything's fine	return true;}function error_exit (message) {    if (arguments.length > 0) alert (unescape(message));    exit();} 