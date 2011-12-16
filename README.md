# Forward Indesign Tools

This is a collection of tools for use with Adobe InDesign and Adobe Photoshop, mostly written by Richard Harrington at the Forward Newspaper in New York.

The scripts at the top level of the directory are wrappers, and they all contain the exact same code. The code checks the name of the file containing itself, and then calls a script starting with the identical name (but ending with .source.jsx instead of .jsx) in the sourcefiles folder. The wrapper scripts are all wrapped themselves in anonymous function calls which also encapsulate the scripts that are called, also.

The purpose of this convolution is so that each script can be reversed by a single Undo action in InDesign or InCopy.

Also in the sourcefiles folder is a folder called StartupItems, which contain the only startup item we use, which is a menu installation script, in addition to StartupItemsInstallationWrapper.jsx, which calls the menu installation script and any other startup items you want to use.

The way that we have this set up at our newspaper is that the repository is stored on the server, aliases to the repository are stored in all the users' script folders, and aliases to the file StartupItemsInstallationWrapper.jsx are stored in their startup scripts folders.

These scripts were written over a period of years, beginning at a time when I hardly knew Javascript. Many will be fairly useless outside of the environment in which they were written, but part of the reason I am putting them up on Github is to motivate myself to make them more general and less hard-coded, and thus more useful to others (and more useful for us at the Forward in the long run). I'll be working on that.

Suggestions or modifications are welcome.

