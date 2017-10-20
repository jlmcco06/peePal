# PeePal
PeePal is a restroom finder application for the city of Philadelphia. It allows users to locate restrooms which are open to the public. Users can rate and review existing locations, add new restrooms, and access available wikipedia and google information about these locations.  


##Requirements

*Knockout v.3.4.2

## Instillation

**Clone** the **PeePal** repository from `https://github.com/jlmcco06/peepal.git` into a directory on your machine using terminal or commandline.

When repository has been cloned, the following files should be present:

* **README.md** - You're reading this!
* **knockout-3.4.2.js** - Knockout JS file
* **style.css** - stylesheet
* **PeePal.html** - HTML file
* **viewmodel.js** - the bread and butter. Contains most of the applications fuctions
* **images** - folder containing images for app use

##Getting started
Open Peepal.html. Once launched in your browser, the application should be initalized with 5 pre-loaded locations. 

##Using PeePal

Hopefully the application is sucessfully running! 

PeePal displays all locations by default.

At this stage, you have the option of entering your location in the location bar at the top of the screen, or choosing a button from the toolbar.

##Setting Location

Entering your location in the address bar will engage an autocomplete call to google maps. Once you have cose your location from the dropdown a pin will be place on the map at the location you have chosen. Alternatively, you mauy choose to drop an pin at your location on the map. Either choice will set the location you have chosen to the userLocation, which will be used by PeePal to help find your restroom.

##Using the Toolbar 

Toolbar options include: 

*Find
	-**Find nearest** - Automatically find the nearest restroom to your current location, and display location profile and directions.
	-**Draw Search Area** - Allows user to draw a circle around the area she would like to search, restrooms within the bounds of the search are will become visible.
	-**Show by rating** - Displays a ratings bar/list. When a rating level is chosen, all restrooms at that rating level or higher will be displayed.
	-Hide All - hide all restrooms on map

*Add
	-**Displays add bar** - Similar to entering your location in the search bar, the add bar will find the location you would like to add. Once you choose the "add" button, the form to enter your own ratings and reviews of the restroom will be displayed. 
*Show All
	-**Displays all locations**
*List
	-**Lists all locations** as buttons, which, when clicked, will center on chosen location and display location profile. 

##Location profile

At any time you may choose to view the location profile by clicking on the toilet paper icons on the map, or clicking on the location name on any list. from here you may choose to:

	-**View average rating** - The "Users think it's" sentence takes the average rating of the location and displays that numeric rating as a string: 1-Gross, 2-Kinda gross, 3-Fine, 4-Kinda clean, 5-Clean.
	-**Read reviews**
	-**Rate/Review** - add your own rating or review
	-**More info** - view more info about the location, including picture, hours, and Wikipedia informatio. You may also choose to leave to the wikipedia page and find out more!
	-**Directions** - Get directions from userLocation whichever profile you're viewing at any time

The location profile is also the place in which any directions request will be displayed.   


  