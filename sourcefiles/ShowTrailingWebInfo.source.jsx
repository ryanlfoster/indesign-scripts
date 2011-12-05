main();function main() {    var myObject;    //Make certain that user interaction (display of dialogs, etc.) is turned on.    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;    if (app.documents.length == 0) {
    	error_exit("No documents are open.  Please open a document and try again.");
    }    if (app.selection.length == 0) {
    	error_exit("Please select something and try again.");
    }
    
    var mySel = app.selection[0];
        switch (mySel.constructor.name) {    case "Character":    case "Word":    case "TextStyleRange":    case "Line":    case "Paragraph":    case "TextColumn":    case "Text":    case "Cell":    case "Column":    case "Row":    case "Table":
            // This if statement is necessary because of an apparent bug that        // will cause the program to crash later if the selection is a Text        // object and not a Story object, when you have the whole story selected.
                myObject = (mySel.length == mySel.parentStory.length) ? mySel.parentStory : mySel;
        break;
            case "Story":        myObject = mySel;        break;
                // If they've selected a text frame, make sure they've selected only one, but if they have selected only one,        // then both a text frame and an insertion point have the same result:  myObject = parentStory.
            case "TextFrame":        if (app.selection.length > 1) {
        	error_exit("If you're going to select a text frame, please select " + 
                     "that text frame and nothing else, and try again.");
        }    case "InsertionPoint":        myObject = mySel.parentStory;        break;    default:
            //Something was selected, but it wasn't a text object, so search the document.
                error_exit("Please select a story, part of a story or a text frame, and start again.");    }    if (!myObject.isValid) {
    	error_exit( "There's been an error of indeterminate nature.  " + 
    	            "Probably best to blame the programmer." );
    }    // AND NOW, THE MEAT OF THIS SCRIPT (THAT OTHER STUFF SHOULD BE IN A LIBRARY.
    
    var myStory = (mySel.constructor.name === "Story") ? mySel : mySel.parentStory;
    
    alert( "The contents of the hidden text that will be put at the end of " +
           "this story when it gets exported to the web:\n\n\n" +
           myStory.label );
}