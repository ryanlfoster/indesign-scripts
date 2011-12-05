/* This InDesign CS2 javascript takes a story that has been prepared for the print edition of the English Forward and processes it for parsing by Symphony, the content management system we use on our website.  Symphony will process files that are in properly-formed xhtml or in markdown (or a combination of both, as long as it can make sense of the input).  This script here goes the markdown route, because it's easier for people who are not familiar with html to read.  When the user runs the script, it whatever is selected and processes the parent story of that selection, whether the selection be a text frame, an insertion point, or a block of text.  It then asks for a filename from the user through a save dialog box.  It adds ".rtf" to the filename if necessary, and then it saves two versions of the story:  one unaltered just for reference, in the file "<user-supplied-filename>.rtf", and the other processed, in the file "√_<user-supplied-filename>.rtf".After the files have been saved, the script places the cursor at the beginning of the story, which has not been altered.------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------Here is a list of the things that the script does:1.  It marks up bold and italic (and bold-italic) text.  In doing this, it IGNORES text style ranges that contain no alphanumeric characters.2.  It gets rid of the bullets at the beginning of book kickers and Forward Looking Back entries.3.  It styles drop caps as regular text, so they don't end up on separate lines from their stories.4.  It deletes pull quotes, jump lines, and extra paragraph breaks.5.  It converts the Philologos h-dots that Kurt and I use (which are just "h.", kerned and adjusted in such a way that the dot ends up below the h) into proper Unicode h-dots, which should display fine on the web.  Our font that we print the paper in does not have this character, which is why we have to do the workaround.  Most fonts used on the web do have the h-dot character, and if the user is using a font that doesn't, then the browser prints only that character in a font that does have it, so it will always display one way or another.6.  It makes the whole file double-spaced, meaning that it converts all occurrences of one paragraph break into two paragraph breaks.  Two paragraph breaks is the markdown version of an html paragraph tag.7.  It styles block quotes and poetry properly.  Intra-stanza line breaks are created in markdown format, which is two spaces at the end of the line followed by a single paragraph return.8.  It eliminates extra spaces in the text.------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------Note:  The user should be reminded that if the outputs from these files are opened in Word, they might end up with gratuitious hyphens which Word actually puts into the text so that if you cut and paste it into Symphony, those hyphens will end up on the web page.  So they should turn off hyphenation in Word, or use TextEdit or something else that doesn't add hyphens.*/

// The function markdownToIndesign() is given an object containing a block// of text, and it finds all the hyperlinks inside the text// that are in markdown format and converts them to // InDesign Hyperlink format (i.e., it removes each URL from// the text itself and puts it into an InDesign Hyperlink).

#include MarkdownToIndesign.library.jsx
	Character.prototype.multiChangeGrep = Word.prototype.multiChangeGrep = TextStyleRange.prototype.multiChangeGrep = Line.prototype.multiChangeGrep = Paragraph.prototype.multiChangeGrep = TextColumn.prototype.multiChangeGrep = Text.prototype.multiChangeGrep = Cell.prototype.multiChangeGrep = Column.prototype.multiChangeGrep = Row.prototype.multiChangeGrep = Table.prototype.multiChangeGrep = Story.prototype.multiChangeGrep = TextFrame.prototype.multiChangeGrep = XMLElement.prototype.multiChangeGrep = Document.prototype.multiChangeGrep = Application.prototype.multiChangeGrep = function (findChangeArray) {  var findChangePair;  app.changeGrepPreferences = NothingEnum.nothing;  app.findGrepPreferences = NothingEnum.nothing;  app.findChangeGrepOptions.properties = {includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false};  for (var i=0; i<findChangeArray.length; i++) {    findChangePair = findChangeArray[i];    app.findGrepPreferences.findWhat = findChangePair.find;    app.changeGrepPreferences.changeTo = findChangePair.change;    this.changeGrep();  app.changeGrepPreferences = NothingEnum.nothing;  app.findGrepPreferences = NothingEnum.nothing;  }}			// multiReplace() is intended to take // an array of find/change pairs, the first// element of each of which will be converted// first into a RegExp, if it comes in as a string.String.prototype.multiReplace = function (findChangeArray) {  var myFind, myChange;  var findChangePair;  var str = this;  for (var i=0; i<findChangeArray.length; i++) {    findChangePair = findChangeArray[i];    myFind = findChangePair.find;    myChange = findChangePair.change;    if (myFind.constructor.name == "String") {      myBefore = RegExp (myFind);    }     str = str.replace (myFind, myChange)  }  return str;}	// Main block.  sort of.	app.scriptPreferences.enableRedraw = false;var myMarkdown = { blockquote : ">", 				   lineBreak  : "  ",				   fontStyles : {bold : "**", italic : "*"} };var myBullets = { bookKicker : "l", forwardLookingBack : "✸", normal : "•" };// REFACTORING NOTE:  ABSTRACT THESE HDots and SDots out to make a hash-table of diacritics!	var myHDots = { capital: {printVersion: "H.", incoming: "HDOT", unicodeValue: "\u1E24"}, 			   lowercase: {printVersion: "h.", incoming: "hDOT", unicodeValue: "\u1E25"} };     var mySDots = { capital: {printVersion: "S.", incoming: "SDOT", unicodeValue: "\u1E62"}, 			   lowercase: {printVersion: "s.", incoming: "sDOT", unicodeValue: "\u1E63"} };     // A lot of times we'll be looking for any paragraph style that has a certain string in// it, say the word "poetry".  These are those strings.// REFACTORING NOTE:  PERHAPS IT MAKES MORE SENSE TO HAVE A LIST OF THE ACTUAL COMPLETE STYLES.// THERE'S NOT THAT MANY OF THEM, AND IT MIGHT BE FASTER.var myStyleStrings = {   pullquote: "pullquote", poetry: "poetry", 						blockquote: "blockquote", bookKicker: "ARTS book", 
						forwardLookingBack: "FLB Body Copy", jumpline: "Jumpline",						suppressFontStyles: ["hed", "pt", "byline", "Philologos", "letter signature", "letters address"] };
						
var myParagraphStyleNames = {	bookKickerTitle: "ARTS book 1.title", bookKickerTitleNoBullet: "ARTS book 1.title no bullet copy",
						bookKickerAuthor: "ARTS book 2.author", bookKickerPublisher: "ARTS book 3.publisher" };var myFontStyleNameSegments = { bold : ["Bold", "Heavy", "Black", "Semibold", "Ultra"], italic : ["Italic", "Oblique"] };

var myFontStyles = { italic: "Book Italic", bold: "Black", book: "Book" };var myAsterisk = "*";// Case-insensitive search of an array of stringsfunction containsAny (myStr, mySearchWords) {	myStr = myStr.toLowerCase();	var i;	for (i=0; i < mySearchWords.length; i++) {		if (myStr.search(mySearchWords[i].toLowerCase()) != -1) {			return true;		}	}	return false;}function reverseString (str) {	var newStr = '';	var i;	for (i=0; i<str.length; i++) {		newStr = newStr + str[str.length-i-1];	}	return newStr;}function onlyWhitespace (obj) /* returns boolean */ {	var i;	var myFoundNonWhitespace;	for (i=0; i<obj.length; i++) {		myFoundNonWhitespace = myFindGrep(obj.characters[i], {findWhat: "[^[:space:]]"}, undefined, {wholeWord: false, caseSensitive: true});		if (myFoundNonWhitespace.length > 0) {			return false;		}	}	return true;}function removeBlock (myStory, i, test, myParagraphStyleStrings) {	var removedSomething = false;	// The function removeBlock is not always testing for paragraph styles, 	// so the second parameter of the passed function, test, is not always used.	while ((i < myStory.paragraphs.length) && (test (myStory.paragraphs[i], myParagraphStyleStrings))) { // second parameter of test here is not always used.		myStory.paragraphs[i].remove();		removedSomething = true;	}	return removedSomething;}function processStory (myStory, mySourceDocName) {		// We have to first convert markdown to indesign format, in case	// anyone has put any markdown into this document.	// Then we escape all remaining asterisks and brackets and things like that,	// and then convert everything back to markdown.
	
	// The first parameter overrides indesign hyperlinks withing markdown hyperlink
	// text, assuming the markdown ones are more intentional at this point.
	// The second parameter overrides ALL indesign hyperlinks, if we've determined
	// that the story has just been imported by Word.
	if (mySourceDocName.slice(-4) == "indd") {
		myStory.markdownToIndesign (true, false);
	}
	else {
		myStory.markdownToIndesign (true, true);
	}
			var i;		// The following if statement ensures that the script will work 	// properly in the case of the last paragraph in the story, because 	// the boundary case code for the end of each paragraph 	// (WHICH BY THE WAY IS KIND OF SQUIRRELLY AND NEEDS TO BE	// REWRITTEN) requires a paragraph break at the end	// of every paragraph.	if (myStory.characters[-1].contents != "\r") {		myStory.insertionPoints[-1].contents = "\r";	}	// Similarly, get rid of all paragraph breaks at the very beginning of the story.	while (myStory.paragraphs[0].length == 1) {		myStory.paragraphs[0].remove();	}		// Get rid of all paragraphs that contain only whitespace	for (i=0; i < myStory.paragraphs.length; i++) {		if (onlyWhitespace(myStory.paragraphs[i])) {			 myStory.paragraphs[i].contents = "\r";		}	}	
  for (i=myStory.paragraphs.length-2; i>=0; i--) { // Note the opening boundary condition is one less than usual.
    var myParagraph = myStory.paragraphs[i];
    var myNextParagraph = myStory.paragraphs[i+1];
    
    // Replace all poetry soft-returns with hard returns, and make sure that
    // all poetry hard returns end up with a spaceAfter, if they already have it
    // or if the paragraph after them has a spaceBefore. Then zero out the spaceAfter
    // on all other paragraphs. This is all for the purpose of using spaceAfter as a 
    // marker in poetry to determine which paragraphs are soft-return and which are
    // hard-return, at the very end.
    
    // First deal with stanza breaks indicated by spaceAfter or spaceBefore.
    if (      (myParagraph.appliedParagraphStyle.name.search(myStyleStrings.poetry) != -1) 
           && (myNextParagraph.appliedParagraphStyle.name.search(myStyleStrings.poetry) != -1)
           && ((myParagraph.spaceAfter != 0) || (myNextParagraph.spaceBefore != 0))  ) {
      myParagraph.spaceAfter = "p12";
    }
    else {
    	myParagraph.spaceAfter = "p0";
    }
    myNextParagraph.spaceBefore = "p0";
    
    // Now go through and deal with stanza connections indicated by soft returns.
    if (myParagraph.appliedParagraphStyle.name.search(myStyleStrings.poetry) != -1) {
	    var myFoundParagraphs = myFindText (myParagraph, {findWhat: "\n"}, {changeTo: "\r"}, {wholeWord: false, caseSensitive: true});
	    // This for loop will not run at all unless the myParagraph was broken up into at least two paragraphs.
	    for (var j=0; j<myFoundParagraphs.length-1; j++) { // note the ending boundary condition is one less than usual
	      myParagraph.paragraphs[j].spaceAfter = 0;
	      myParagraph.paragraphs[j+1].spaceBefore = 0;
	    }
    }
  }
		// Now deal with the story paragraph by paragraph.		for (i=0; i < myStory.paragraphs.length; i++) {		var myParagraph = myStory.paragraphs[i];		if (i+1 < myStory.paragraphs.length) {			var myNextParagraph = myStory.paragraphs[i+1];		}		else {			var myNextParagraph = 'end of story';		}				// 1.  Get rid of empty paragraphs after this one, and replace them with space-after.		// This will help later in parsing the poetry properly.		var testForParagraphBreaks = function (paragraph) {			return paragraph.length == 1;		}		if (removeBlock (myStory, i+1, testForParagraphBreaks)) {			myParagraph.spaceAfter = 'p12';		}				// 2.  Get rid of pullquotes and jumplines after this paragraph.		var testForStyles = function (paragraph, styleStrings) {			for (var str in styleStrings) {				if (paragraph.appliedParagraphStyle.name.search(styleStrings[str]) != -1) {					return true;				}			}			return false;		}		if (removeBlock (myStory, i+1, testForStyles, [myStyleStrings.pullquote, myStyleStrings.jumpline] )) {
			var lastIndex;			// Find out what the last character of the paragraph is, before 
			// any quote marks and white space.  The reason this is so convoluted
			// is that I can't figure out how to have InDesign's text regexp engine
			// deal with quote characters.
			
			var myTempRegexp = /\S\s*?$/.toString().slice(1,-1);
			var myResult = myFindGrep(myParagraph, {findWhat: myTempRegexp});
			if (myResult != null && myResult.length == 1) {
				lastIndex = myResult[0].index;
				if (myStory.characters[lastIndex].contents == SpecialCharacters.DOUBLE_RIGHT_QUOTE || 
			            myStory.characters[lastIndex].contents == SpecialCharacters.SINGLE_RIGHT_QUOTE) {
			    lastIndex--;
			  }
			  switch (myStory.characters[lastIndex].contents) {
			  	case "-":
			  	  // Remove the hyphen, join the hyphenated word together and concatenate the two paragraphs.
			  	  myResult[0].contents = "";
			  	  // Reset myParagraph.			      myParagraph = myStory.paragraphs[i];
			      // Concatenate.
    			  myParagraph.characters[-1].contents = "";
    			  break;
    			case "?":
    			case "!":
    			case ".":
    			  // If the paragraph is fully justified, assume that it's not supposed
    			  // to be a real paragraph break, and concatenate.  Otherwise, do nothing.
    			  if (myParagraph.justification == Justification.fullyJustified) {
    			  	myParagraph.characters[-1].contents = " "; // one space, replaces the paragraph return.
    			  }
    			  // else do NOT concatenate, and exit the switch statement.
    			  break;
    			default:
    			  // When in doubt, concatenate.
    			  myParagraph.characters[-1].contents = " "; // one space, replaces the paragraph return.
			  }
			}
			// I'm not sure if we'll ever need this else statement, but it's the case where
			// the paragraph consists of only whitespace.  I think that will never happen
			// because of the cleanup procedures that have preceded this, but I'm not sure.
			else {}
			// Reset myParagraph.			myParagraph = myStory.paragraphs[i];
		}				// 3.  Go through all non-poetry paragraphs and replace soft returns with spaces.
		// All of the soft returns in poetry paragraphs should already have been dealth
		// with anyway, but just in case, we test here for poetry paragraph styles.
		
		if (myParagraph.appliedParagraphStyle.name.search(myStyleStrings.poetry) == -1) {
			myFindText(myParagraph, {findWhat: "\n"}, {changeTo: " "}, {wholeWord: false, caseSensitive: true});
		}		// Reset myParagraph
		myParagraph = myStory.paragraphs[i];
		
		// 3a. Get rid of spaces at the end of the paragraph (should do this with GREP maybe).
	  while (myParagraph.characters[-2].contents == ' ') myParagraph.characters[-2].contents = '';
				// 4.  Get rid of all rules before and after.
		// And get rid of drop caps and also the forced justification that was in the pullquotes and jumplines.		myParagraph.ruleAbove = false;		myParagraph.ruleBelow = false;		myParagraph.dropCapCharacters = 0;		myParagraph.justification = Justification.leftJustified;				// 5.  Get rid of forward looking back bullets.		if ((myParagraph.appliedParagraphStyle.name.search(myStyleStrings.forwardLookingBack) != -1) 					&& (myParagraph.characters[0].contents == myBullets.forwardLookingBack)) {			myParagraph.characters[0].contents = '';			if (myParagraph.characters[0].contents == ' ') {				myParagraph.characters[0].contents = '';			}					}
		
		// 6-pre-a.  Map book kicker styles to how we want them to appear on the web.
		// Also mark them for soft returns.
		if (myParagraph.appliedParagraphStyle.name.search(myStyleStrings.bookKicker) != -1) {
			// First, override local attribute changes to make sure that the myFontStyles
			// names exist for the font in the paragraph.
			myParagraph.applyParagraphStyle (myParagraph.appliedParagraphStyle);
			// Now convert everything to slimbach, so as not to have problems with the Zapf dingbats
			// in the bullet, later.
			myParagraph.appliedFont = "ITC Slimbach";
			
			// Then, get rid of book kicker bullets.
			// REFACTORING NOTE:  THIS IS SORT OF CONFUSING AND LAME, AND ALSO COULD BE 			// COMBINED SOMEHOW WITH THE PREVIOUS BLOCK (#5)?			if (myParagraph.characters[0].contents == myBullets.bookKicker) {				myParagraph.characters[0].contents = '';				if (myParagraph.characters[0].contents == ' ') {					myParagraph.characters[0].contents = '';				}			}			// Now map the print styles to web styles
			switch (myParagraph.appliedParagraphStyle.name) {
				case myParagraphStyleNames.bookKickerTitle:
				case myParagraphStyleNames.bookKickerTitleNoBullet:
//				  alert (myParagraph.characters[0].appliedFont.fontFamily + "     " + myParagraph.characters[5].appliedFont.fontFamily +"\r\r" + myParagraph.contents);
				  myParagraph.fontStyle = "Black" /* myFontStyles.bold*/ ;
				  break;
				case myParagraphStyleNames.bookKickerAuthor:
				  myParagraph.fontStyle = myFontStyles.italic;
				  break;
				case myParagraphStyleNames.bookKickerPublisher:
				  myParagraph.fontStyle = myFontStyles.book;
			}
			// Mark them for soft returns unless we're at the end of the book kicker section.
			if ((myNextParagraph != 'end of story') && (myNextParagraph.appliedParagraphStyle.name.search(myStyleStrings.bookKicker) != -1)) {
				myParagraph.spaceAfter = "p0";
			}
		}
				// 6a.  Change Zapf dingbats bullets to regular bullets.		myFindText(myParagraph, {findWhat: myBullets.sectionBreak, appliedFont: "ITC Zapf Dingbats"}, 														{changeTo: myBullets.normal}, {wholeWord: false, caseSensitive: true});																// 6b. Kill hyphenation.		myParagraph.hyphenation = false;
		
		
		// REFACTORING NOTE:  THIS H-dot and S-dot code should not be repeated FOUR TIMES. Egregious.
				// 7.  Transform h-dots from print paper to Unicode.		var myFoundHDots = myFindText(myParagraph, {findWhat: myHDots.lowercase.printVersion}, undefined, {wholeWord: false, caseSensitive: false});		var h;		for (h = myFoundHDots.length-1; h >= 0; h--) {			if (myFoundHDots[h].characters[-1].baselineShift != 0) {				for (var myCase in myHDots) {					if (myFoundHDots[h].contents == myHDots[myCase].printVersion) {						myFoundHDots[h].contents = myHDots[myCase].unicodeValue;					}				}			}		}		// 7a.  Transform h-dots from outside sources to Unicode.		var myFoundHDots = myFindText(myParagraph, {findWhat: myHDots.lowercase.incoming}, undefined, {wholeWord: false, caseSensitive: false});		var h;		for (h = myFoundHDots.length-1; h >= 0; h--) {			for (var myCase in myHDots) {				if (myFoundHDots[h].contents == myHDots[myCase].incoming) {					myFoundHDots[h].contents = myHDots[myCase].unicodeValue;				}			}		}		// 7b.  Transform s-dots from print paper to Unicode.  		var myFoundSDots = myFindText(myParagraph, {findWhat: mySDots.lowercase.printVersion}, undefined, {wholeWord: false, caseSensitive: false});		var s;		for (s = myFoundSDots.length-1; s >= 0; s--) {			if (myFoundSDots[s].characters[-1].baselineShift != 0) {				for (var myCase in mySDots) {					if (myFoundSDots[s].contents == mySDots[myCase].printVersion) {						myFoundSDots[s].contents = mySDots[myCase].unicodeValue;					}				}			}		}		// 7c.  Transform s-dots from outside sources to Unicode.		var myFoundSDots = myFindText(myParagraph, {findWhat: mySDots.lowercase.incoming}, undefined, {wholeWord: false, caseSensitive: false});		var s;		for (s = myFoundSDots.length-1; s >= 0; s--) {			for (var myCase in mySDots) {				if (myFoundSDots[s].contents == mySDots[myCase].incoming) {					myFoundSDots[s].contents = mySDots[myCase].unicodeValue;				}			}		}		// 8.  Escape asterisks.		myFindText(myParagraph, {findWhat: myAsterisk}, {changeTo: "\\" + myAsterisk}, {wholeWord: false, caseSensitive: true});		// 9.  Get rid of multiple spaces (which may very well have been added when concatenating paragraphs).		myFindGrep(myParagraph, {findWhat: " +"}, {changeTo: " "}, {wholeWord: false, caseSensitive: true});				// 10.  Put markdown asterisk tags around bold, italic, and bold italic sections.		var myPreviousFontStyles = { bold: false, italic: false };		var myCurrentFontStyles = { bold: false, italic: false };				// This "for" loop (after first testing to make sure that j number of textStyleRanges even exist)		// tests to make sure the textStyleRange starts at the last character BEFORE		// the paragraph return, or earlier.  Any textStyleRanges that start at the paragraph return		// (or, because of an awesome Indesign CS4 bug, on the next line) will be ignored.				for (var j=0; j < myParagraph.textStyleRanges.length && myParagraph.textStyleRanges[j].index < myParagraph.insertionPoints[-2].index; j++) {						var myRange = myParagraph.textStyleRanges[j];			var myFoundCharacters = myFindGrep(myRange, {findWhat: "[[:alnum:]]"}, undefined, {wholeWord: false, caseSensitive: true});						if (myFoundCharacters.length > 0) {				for (var style in myMarkdown.fontStyles) {					// This is tricky:  First deal with the special case of when there's an extra space at the end of a bold or 					// italic segment, because then we have to add the markdown at position j-1.										// Then deal with the the case of when there's an extra space at the beginning of a bold					// or italic segment, in which case we won't add the markdown but will instead just prepare					// the TextStates arrays to behave properly on the next iteration through the loop.					// Then finally we get to the general case of a change in bold or italic status.					myCurrentFontStyles[style] = 	(	(containsAny (myRange.fontStyle, myFontStyleNameSegments[style]))													&& 	(!containsAny (myParagraph.appliedParagraphStyle.name, myStyleStrings.suppressFontStyles))	);										if ((myPreviousFontStyles[style] == false) && (myCurrentFontStyles[style] == true)) {						// Get rid of leading spaces in the upcoming bold or italic sequence, by setting the index k to the insertion point.						for (var k=myRange.index; myStory.characters[k].contents == ' '; k++);						myStory.insertionPoints[k].contents = myMarkdown.fontStyles[style];					}										else if ((myPreviousFontStyles[style] == true) && (myCurrentFontStyles[style] == false)) {						// Now get rid of trailing spaces in the previous bold or italic sequence, by setting the index k to the insertion point.						// This is slightly more tricky.  AND ESPECIALLY SO IF THE PRECEDING SPACE IS BOLD BUT IN A DIFFERENT						// TEXT STYLE RANGE FROM THE BLOCK BEFORE THAT, WHICH ALSO ENDS IN SPACES.  BASICALLY, THIS WILL NEVER HAPPEN.						// BUT JUST TO BE THOROUGH, LET'S TEST WHEN WE GET TO WORK TOMORROW TO MAKE SURE THAT YOU CAN CRUISE BACK BEFORE						// THE BEGINNING OF A TEXTSTYLERANGE WITH A NEGATIVE INDEX GREATER IN MAGNITUDE THAN THE LENGTH OF THE TEXTSTYLERANGE.						for (var k=myRange.index; myStory.characters[k-1].contents == ' '; k--);						myStory.insertionPoints[k].contents = myMarkdown.fontStyles[style];					}							myPreviousFontStyles[style] = myCurrentFontStyles[style];						}				}		}						//  11.  Take all e-mail addresses that are not already hyperlinks and turn them into hyperlinks.		var myRegexpString = /[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,5}/.toString().slice(1,-1);		var myFoundEmails = myFindGrep(myParagraph, {findWhat: myRegexpString});		var myFoundEmail;		var myDoc = myStory.parent;		var myHyperlinkTextSource, myHyperlinkURLDest, myNewHyperlink;		for (var eNum=0; eNum < myFoundEmails.length; eNum++) {			myFoundEmail = myFoundEmails[eNum];			try {				myHyperlinkTextSource = myDoc.hyperlinkTextSources.add (myFoundEmail); // This will fail when the text in question is already a hyperlink.				myHyperlinkURLDest = myDoc.hyperlinkURLDestinations.add();				myNewHyperlink = myDoc.hyperlinks.add(myHyperlinkTextSource, myHyperlinkURLDest);				myNewHyperlink.destination.destinationURL = "mailto:" + myFoundEmail.contents;				myNewHyperlink.name = myFoundEmail.contents;			}			catch (e) { } // This will happen if the e-mail address is already a hyperlink.		}						//  12.  Take all twitter @ tags that are not already hyperlinks and turn them into hyperlinks.		var myRegexpString = /(?<=\s)@\w+\>/.toString().slice(1,-1);		var myFoundTwitters = myFindGrep(myParagraph, {findWhat: myRegexpString});		var myFoundTwitter;		var myDoc = myStory.parent;		var myHyperlinkTextSource, myHyperlinkURLDest, myNewHyperlink;		for (var eNum=0; eNum < myFoundTwitters.length; eNum++) {			myFoundTwitter = myFoundTwitters[eNum];			try {				myHyperlinkTextSource = myDoc.hyperlinkTextSources.add (myFoundTwitter); // This will fail when the text in question is already a hyperlink.				myHyperlinkURLDest = myDoc.hyperlinkURLDestinations.add();				myNewHyperlink = myDoc.hyperlinks.add(myHyperlinkTextSource, myHyperlinkURLDest);				myNewHyperlink.destination.destinationURL = "http://www.twitter.com/" + myFoundTwitter.contents.slice(1);				myNewHyperlink.name = myFoundTwitter.contents;			}			catch (e) { } // This will happen if the twitter tag is already a hyperlink.		}						// Now take care of the very end of the paragraph.  Special case.  This is necessary		// to put markdown sequences on bold and italic tags at the end of every paragraph if they are needed,		// because indesign textStyleRanges cross over paragraphs while inline markdown tags		// (like bold and italic) do not.				for (var style in myMarkdown.fontStyles) {			if (myCurrentFontStyles[style] == true) myParagraph.insertionPoints[-2].contents = myMarkdown.fontStyles[style];		}					// OTHER STUFF TO BE DONE:		// Maybe fix up other random little stuff like the capitalization of the subhed of each section in Forward Looking Back.					// Markdown blockquotes and poetry 		if (((myParagraph.appliedParagraphStyle.name.search(myStyleStrings.blockquote) != -1) 			|| (myParagraph.appliedParagraphStyle.name.search(myStyleStrings.poetry) != -1))				&& (myParagraph.contents[0] != myMarkdown.blockquote)				&& (myParagraph.length > 1)) {						myParagraph.insertionPoints[0].contents = myMarkdown.blockquote;		}	}	// Now that all the line-by-line stuff is done, go back through the whole story.		// 1. Clean up extra line breaks (i.e. more than two in a row) 	// Note:  MAKE THIS UNNECESSARY LATER.  RIGHT NOW I JUST CAN'T FIGURE OUT WHY	// IT'S CREATING THOSE EXTRA PARAGRAPH BREAKS IN THE FIRST PLACE.	var tempDebug;	tempDebug = myFindGrep(myStory, {findWhat: "\r\r\r+"}, {changeTo: "\r\r"}, {wholeWord: false, caseSensitive: true});	if (tempDebug.length > 0) {	}		// 2. Markdown the soft returns	// (i.e., convert them to single hard returns with two spaces before them).		for (i=myStory.paragraphs.length-2; i>=0; i--) { // Note the opening boundary condition is one less than usual.
		var myParagraph = myStory.paragraphs[i];
		var myNextParagraph = myStory.paragraphs[i+1];
		
		// If it and the paragraph after it are both either poetry or book kickers, and it's got no spaceAfter, then add two spaces at the end of the paragraph.
		if ( (     (    (myParagraph.appliedParagraphStyle.name.search(myStyleStrings.poetry) != -1) 
		             && (myNextParagraph.appliedParagraphStyle.name.search(myStyleStrings.poetry) != -1) )
		        || (    (myParagraph.appliedParagraphStyle.name.search(myStyleStrings.bookKicker) != -1) 
		             && (myNextParagraph.appliedParagraphStyle.name.search(myStyleStrings.bookKicker) != -1) ) )
		     && (myParagraph.spaceAfter == 0) ) {
		  myParagraph.insertionPoints[-2].contents = "  ";
		}
		// Else add a carriage return, making a markdown paragraph tag.
		else { 
			myParagraph.insertionPoints[-1].contents = "\r";
		}
	}
	
	// Get rid of spaceAfter.
	for (i=0; i<myStory.paragraphs.length; i++) {
		myStory.paragraphs[i].spaceAfter = "p0";
	}
		// Get rid of the extra paragraph marks at the end of the story.	while (myStory.characters[-1].contents == '\r') myStory.characters[-1].contents = '';		// Really last but not least, convert all Indesign hyperlinks to markdown.	var myHyperlink;	var myDoc = myStory.parent;	var mySourceStr, myDestStr;	// First deal with the hyperlinks.	for (i = myDoc.hyperlinks.length-1; i >= 0; i--) {		myHyperlink = myDoc.hyperlinks[i];		mySourceText = myHyperlink.source.sourceText;		// Escape closing brackets, square and round, and opening square brackets.		myFindGrep (mySourceText, {findWhat: "]"}, {changeTo: "\\]"});		myFindGrep (mySourceText, {findWhat: "\\["}, {changeTo: "\\["});		myHyperlink.destination.destinationURL = myHyperlink.destination.destinationURL.replace(/)/g, "\\)");		// Only process hyperlinks that are in this story.		if (mySourceText.parentStory == myStory) {			mySourceText.contents = "[" + mySourceText.contents + "](" + myHyperlink.destination.destinationURL +")";		}	}
	
	// And really really last but not least, reconstitute Notes that were originally block-level html
	// from the web.
	if (myStory.notes.length > 0) {
		var myNote;
		var myNoteIndex; 		for (i = myStory.notes.length-1; i >= 0; i--) {
 			myNote = myStory.notes[i];
 			myNoteIndex = myStory.notes[i].storyOffset.index;
 			app.findGrepPreferences = NothingEnum.nothing;
 			app.changeGrepPreferences = NothingEnum.nothing;
 		  app.findGrepPreferences.findWhat = "^<.*?>$";
	    myResults = myNote.texts[0].findGrep();
 			app.findGrepPreferences = NothingEnum.nothing;
 			app.changeGrepPreferences = NothingEnum.nothing;
	    // If it's a hidden block-level html element, make it into a markdown paragraph.	    
	    if (myResults.length > 0) {
	    	// First, replace typographer's quotes.
				var mySavedTypographersQuotes = myDoc.textPreferences.typographersQuotes;
				myDoc.textPreferences.typographersQuotes = false;
	    	app.findGrepPreferences.findWhat = "[“”]";
	    	app.changeGrepPreferences.changeTo = '"';
	    	myNote.texts[0].changeGrep();
	    	app.findGrepPreferences.findWhat = "[‘’]";
	    	app.changeGrepPreferences.changeTo = "'";
	    	myNote.texts[0].changeGrep();
    		myDoc.textPreferences.typographersQuotes = mySavedTypographersQuotes;
	    	// If it's an html element at the very beginning of the story, add some space after it.
	    	if (myNoteIndex == 0) {
	    		myStory.insertionPoints[myNoteIndex+1].contents = '\r\r';
	    	}
	    	// Otherwise add some space before it.
	    	else { 
	    		myStory.insertionPoints[myNoteIndex].contents = '\r\r';
	    	}
	    }
	    // Else it's an editorial comment, so make it an html comment.
	    else {
	 			myStory.insertionPoints[myNoteIndex+1].contents = ' -->';
	 			myStory.insertionPoints[myNoteIndex].contents = '<!-- ';
	 			myNote.texts[0].contents = "Note " + (i+1);
	    }
	    // In any case, convert the note to text.
	    myNote.convertToText();
	    
 		} 
	}
	
	//Now restore the web-only footer (if any), 
	//which has been stored as a label while the story is in print
	var myDoc = myStory.parent;
	if (myStory.label != "") {
		var mySavedTypographersQuotes = myDoc.textPreferences.typographersQuotes;
		myDoc.textPreferences.typographersQuotes = false;
		var myStr = myStory.label;
		var i;
		var j;
		while (myStr.indexOf("<") != -1) {		  i = myStr.indexOf("<");		  j = myStr.indexOf(">");		  mySubstring = myStr.slice(i, j+1);		  myBeforeSubstring = myStr.slice (0, i);		  myAfterSubstring = myStr.slice (j+1);		  mySubstring = mySubstring.replace (/[“”]/g, '"');		  mySubstring = mySubstring.replace (/[‘’]/g, "'");		  myStr = myBeforeSubstring + "&#&#" + mySubstring.slice (1, -1) + "&@&@" + myAfterSubstring;		}
		myStr = myStr.replace (/&#&#/g, "<");    myStr = myStr.replace (/&@&@/g, ">");		myStory.insertionPoints[-1].contents = "\r\r" + myStr;
		myDoc.textPreferences.typographersQuotes = mySavedTypographersQuotes;
	}
	
  // Clean up: get rid of all paragraph breaks at the very beginning of the story 
  // (this is kludgy, because we already did it earlier).	while (myStory.paragraphs[0].length == 1) {		myStory.paragraphs[0].remove();	}
		
}

  	
	

var mySelection = app.selection[0];if (typeof mySelection != 'undefined') {	switch (mySelection.constructor.name) {		case "Character":		case "Word":		case "TextStyleRange":		case "Line":		case "Paragraph":		case "TextColumn":		case "Text":		case "InsertionPoint" :		case "TextFrame" :					var myStory = mySelection.parentStory;			if (app.name == "Adobe InDesign") {
				var myGhostFile = File.saveDialog ("Please save your file.  The suffix \".rtf\" will be added automatically.");				if (myGhostFile == null) exit();				var myPath = myGhostFile.path;				var myBaseName = myGhostFile.name;				myGhostFile.remove();								// Just in case the user doesn't read that prompt above:				if (myBaseName.slice(-4) == ".rtf") {					myBaseName = myBaseName.slice (0, -4)				}								var myExportedFile = new File (myPath + "/" + myBaseName + ".rtf");				myExportedFile.open();								var myScratchDoc = app.documents.add (/*showingWindow*/ false);				// Because it's InDesign, we have to add a textFrame to the new document.
				var myScratchTextFrame = myScratchDoc.pages[0].textFrames.add();				var myScratchStory = myScratchTextFrame.parentStory;				myStory.duplicate (LocationOptions.AFTER, myScratchStory.insertionPoints[0]);
				myScratchStory.label = myStory.label;
				
				// We have to pass the original document also now, so that we can 
				// determine whether we're in an incopy document or an indesign document
				// (to determine what to do with extraneous hyperlinks				processStory (myScratchStory, myStory.parent.name);				myScratchStory.exportFile (ExportFormat.RTF, myExportedFile);								myScratchDoc.close(SaveOptions.NO);				myExportedFile.close();					     	    // Open the resulting text file in TextEdit, so people can 			    // see it was created.			    app.doScript ('tell application "TextEdit" \r' +	                     '  activate \r' +	                     '  open ("' + myExportedFile.fsName + '") \r' +	                     'end tell' ,	                     ScriptLanguage.APPLESCRIPT_LANGUAGE);
			}
			// Else it's inCopy
			else {
				var myScratchDoc = app.documents.add (/*showingWindow*/ true);
				// app is InCopy, where a text frame would get added automatically in a new document.				var myScratchTextFrame = myScratchDoc.pages[0].textFrames[0];				var myScratchStory = myScratchTextFrame.parentStory;				myStory.duplicate (LocationOptions.AFTER, myScratchStory.insertionPoints[0]);
				
				// We have to pass the original document also now, so that we can 
				// determine whether we're in an incopy document or an indesign document
				// (to determine what to do with extraneous hyperlinks				processStory (myScratchStory, myStory.parent.name);
			}	
			// And here, in the inCopy version, we're done. We just leave the new inCopy document open.
			
			break;
				
		default :
		  alert ("You need to select some text or a text frame.");	}}else {	alert ("You need to select something.");}// This will take a string.
function convertStringToStraightQuotes (myStr) {
  myStr = myStr.replace (/[“”]/g, '"');
  myStr = myStr.replace (/[‘’]/g, "'");
  return myStr;
}
  
// This will take an InDesign text object.
function convertTextObjectToStraightQuotes (myObject) {
  myFindText (myObject, {findWhat: '“'}, {changeTo: '"'}, undefined);
  myFindText (myObject, {findWhat: '”'}, {changeTo: '"'}, undefined);
  myFindText (myObject, {findWhat: "‘"}, {changeTo: "'"}, undefined);
  myFindText (myObject, {findWhat: "’"}, {changeTo: "'"}, undefined);
}
  
					function myFindText(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){	//Reset the find/change preferences before each search.	app.changeTextPreferences = NothingEnum.nothing;	app.findTextPreferences = NothingEnum.nothing;	app.findTextPreferences.properties = myFindPreferences;	if (myChangePreferences) app.changeTextPreferences.properties = myChangePreferences;	if (myFindChangeOptions) app.findChangeTextOptions.properties = myFindChangeOptions;	var myFoundItems;	if (myChangePreferences) {		myFoundItems = myObject.changeText();	}	else {		myFoundItems = myObject.findText();	}	//Reset the find/change preferences after each search.	app.changeTextPreferences = NothingEnum.nothing;	app.findTextPreferences = NothingEnum.nothing;	return myFoundItems;}function myFindGrep(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){	//Reset the find/change grep preferences before each search.	app.changeGrepPreferences = NothingEnum.nothing;	app.findGrepPreferences = NothingEnum.nothing;	app.findGrepPreferences.properties = myFindPreferences;	if (myChangePreferences) app.changeGrepPreferences.properties = myChangePreferences;	if (myFindChangeOptions) app.findChangeGrepOptions.properties = myFindChangeOptions;	var myFoundItems;	if (myChangePreferences) {		myFoundItems = myObject.changeGrep();	}	else {		myFoundItems = myObject.findGrep();	}	//Reset the find/change grep preferences after each search.	app.changeGrepPreferences = NothingEnum.nothing;	app.findGrepPreferences = NothingEnum.nothing;	return myFoundItems;}function myFindGlyph(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){	//Reset the find/change glyph preferences before each search.	app.changeGlyphPreferences = NothingEnum.nothing;	app.findGlyphPreferences = NothingEnum.nothing;	app.findGlyphPreferences.properties;	if (myChangePreferences) app.changeGlyphPreferences.properties;	if (myFindChangeOptions) app.findChangeGlyphOptions.properties;	if (myChangePreferences) {		myFoundItems = myObject.changeGlyph();	}	else {		myFoundItems = myObject.findGlyph();	}	//Reset the find/change glyph preferences after each search.	app.changeGlyphPreferences = NothingEnum.nothing;	app.findGlyphPreferences = NothingEnum.nothing;	return myFoundItems;}app.scriptPreferences.enableRedraw = true;	/*// debugging text					if (!confirm ("Paragraph " + i +", TextStyleRange " + j + " contents : " + myParagraph.textStyleRanges[j].contents + "\r\r"										+ "myPreviousFontStyles['bold'] = " + myPreviousFontStyles['bold'] + "\r"										+ "myPreviousFontStyles['italic'] = " + myPreviousFontStyles['italic'] + "\r\r"										+ "myCurrentFontStyles['bold'] = " + myCurrentFontStyles['bold'] + "\r"										+ "myCurrentFontStyles['italic'] = " + myCurrentFontStyles['italic'])) {						return;					}// end debugging text						*/