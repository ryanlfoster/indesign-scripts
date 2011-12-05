// Set to 6.0 scripting object model (Indesign CS4)app.scriptPreferences.version = 6.0;


TextFrame.prototype.renumberColumns = function () {
	var myTextFrame = this;
	var myTextFrameWidth = myTextFrame.geometricBounds[3] - myTextFrame.geometricBounds[1];	var myDoc = app.activeDocument;	var myPage = findPage (myTextFrame);	var myDocWidth = app.activeDocument.documentPreferences.pageWidth - myPage.marginPreferences.left - myPage.marginPreferences.right;	var myColumnNum = myPage.marginPreferences.columnCount;	var myColumnDivisionsWidth = myDocWidth / myColumnNum;	myTextFrame.textFramePreferences.textColumnCount = Math.round (myTextFrameWidth / myColumnDivisionsWidth);
}



main();function main(){	var myFrame;	//Make certain that user interaction (display of dialogs, etc.) is turned on.	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;	if (app.documents.length == 0) tryAgain ("No documents are open.  Please open a document and try again.");	if (app.selection.length == 0) tryAgain ("Please select something and try again.");
	if (app.selection.length > 1) tryAgain ("Please select only one thing (a text box or a block of text inside a text box) and try again.");	switch(app.selection[0].constructor.name){
		case "InsertionPoint":		case "Character":		case "Word":		case "TextStyleRange":		case "Line":		case "Paragraph":		case "TextColumn":		case "Text":		case "Cell":		case "Column":		case "Row":		case "Table":		case "Story":
		  if (app.selection[0].parentStory.textContainers.length > 1) {
		    tryAgain ("Please select the text box itself, not any of the text inside the box.\r\r" +
		    					"(If the story existed inside only one box, you would be able to run " +
		    					"this script by selecting text inside the box, but I haven't yet figured " +
		    					"out how to tell which box a particular piece of text is in, when it's a multi-box " +
		    					"story.  So the script can't tell which box you want.  This will be fixed in " +
		    					"the future.)");
		  }
			myFrame = app.selection[0].parentStory.textContainers[0];
			break;		// If they've selected a text frame, make sure they've selected only one, but if they have selected only one,		// then both a text frame and an insertion point have the same result:  myObject = parentStory.		case "TextFrame":		    myFrame = app.selection[0];		    break;		default:			//Something was selected, but it wasn't a text object, so search the document.			tryAgain ("Please select a text box or some text inside a text box.");	}
	if (myFrame == null) tryAgain ("There's been a problem of indeterminate nature.  Probably best to blame the programmer.");
	myFrame.renumberColumns();	}


function tryAgain (message) {    if (arguments.length > 0) alert (message);    exit();} 

// findPage is By Dave Saunders//var myDoc = app.activeDocument;//var myObj = app.selection[0];//$.write("The selected object is on page " + findPage(myObj).name + "\n") ; function findPage(theObj) {     var thePage = theObj;     if (thePage.hasOwnProperty("baseline")) {       thePage = thePage.parentTextFrames[0];     }     while (thePage.constructor.name != "Page") {       var whatIsIt = thePage.constructor.name;       switch (whatIsIt) {         case "Story" :           thePage = thePage.textFrames[-1].parent;           break;         case  "Character" :           thePage = thePage.parentTextFrames[0];           break;         case "Cell" :           try {             thePage = thePage.insertionPoints[0].parentTextFrames[0];             break;           } catch (e) {             // must be overset, so ignore             return null;           }         case "Application" :           // must be off page, so ignore           return null;       }       thePage = thePage.parent;     }     return thePage   }