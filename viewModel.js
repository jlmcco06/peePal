// Model defiend below viewModel due to length or entries
var viewModel = {
  /*global arrayContainer:true, SliderInstance:true, DomObjects:true */
  createMarker : function (location) {
    var placeInfo = new google.maps.InfoWindow();
    pos = location.location;
    name = location.title;
    id = location.id;
    map = map;
    icon = "images/TP.png";

    mark = new google.maps.Marker({
      id: id,
      position: pos,
      map: map,
      title: name,
      animation: google.maps.Animation.DROP,
      visible: false,
      icon: icon,
    });
    //add each mark to markers
    model.markers.push(mark);
    //attach info window function to each marker when clicked
    mark.addListener("click", function() {
      viewModel.addWindowInfo(this, placeInfo);
      viewModel.displayLocationProfile(this.id);
      this.setAnimation(google.maps.Animation.BOUNCE);
    });
  },

  initializeMarkers: function () {
    //iterate over restrooms list to create markers
    for ( i = 0 ; i < model.restRooms.length; i += 1 ) {
      this.createMarker(model.restRooms[i]);  
    }
  },

  showAllMarkers: function(){
    this.hideAllPopUps();
    for (i = 0; i < model.markers.length; i += 1) {
      model.markers[i].setVisible(true);
    }
    this.showHiddenBar(true);
  },
  
  hideAllMarkers: function(){
    this.showLocationProfile(false);
    if (activeWindow) {
      activeWindow.close();
    }
    directionsDisplay.setMap(null);
    for (i = 0; i < model.markers.length; i += 1) {
      model.markers[i].setVisible(false);
      this.showHiddenBar(false);
    }
  },

  showFindBox: ko.observable(false),
  showHiddenBar: ko.observable(false),
  showSubmitForm: ko.observable(false),
  showAddBox: ko.observable(false),
  showAddForm: ko.observable(false),
  showLocationsList: ko.observable(false),
  showAddedMessage: ko.observable(false),
  showLocationProfile: ko.observable(false),
  showReviewForm: ko.observable(false),
  showDirections: ko.observable(false),
  showFiltersBar: ko.observable(false),
  showEraseCircle: ko.observable(false),
  showRatingsFilter: ko.observable(false),
  showMoreInfo: ko.observable(false),
  profileName: ko.observable(),
  profileAddress: ko.observable(),
  profileHours: ko.observable(),
  profileWiki: ko.observable(),
  hoursArray : ko.observableArray(),
  detailsImage : ko.observable(),
  wikiLink : ko.observable(),
  showMessage : ko.observable(),
  restroomsArray : ko.observableArray(),
  profileRating : ko.observable(),
  reviewsArray : ko.observableArray(),

  displayFindBox: function(){
    this.hideAllPopUps();
    this.showFindBox(true);
  },

  displayAddBox: function(){
    this.showLocationProfile(false);
    this.hideAllPopUps();
    this.showAddBox(true);
  },

  displayFiltersBar: function() {
    this.hideAllPopUps();
    this.showFiltersBar(true);
  },

  hideAllPopUps: function(){
    viewModel.showHiddenBar(false);
    viewModel.showFindBox(false);
    viewModel.showAddBox(false);
    viewModel.showAddForm(false);
    viewModel.showSubmitForm(false);
    viewModel.showLocationsList(false);
    viewModel.showAddedMessage(false);
    viewModel.showReviewForm(false);
    viewModel.showDirections(false);
    directionsDisplay.setMap(null);
    viewModel.showFiltersBar(false);
    viewModel.showRatingsFilter(false);
  },

  findNearest: function(){
    //declare callback function for directions use
    function callback(response, status) {
      var closestId;
      var closestPos;
      if (status == "OK") {
        markerDist = response.destinationAddresses;
        matrixResponse = markerDist;
        var currentDist;
        var closest = response.rows[0].elements[0].distance.value;
        for (i = 0; i < markerDist.length; i++) {
          currentDist = response.rows[0].elements[i].distance.value;
          if (closest >= currentDist) {
            closestLoc = model.markers[i];
            closest = currentDist;
            closestId = model.markers[i].id;
            closestPos = model.markers[i].getPosition();
          } 
        }
        viewModel.hideAllMarkers();
        closestLoc.setVisible(true);
        closestLoc.setAnimation(google.maps.Animation.BOUNCE);
        viewModel.displayLocationProfile(closestId);
        viewModel.displayDirections(userLocation,closestPos); 
      } else if (status == "NOT_FOUND" || status == "ZERO_RESULTS") {
        viewModel.showHiddenMessage("Nope", "Unable to get directions for entered locations");
      }
    }
    // check user location
    if (userLocation) {
      origin = userLocation.getPosition();
      var dests = [];
      var distServ = new google.maps.DistanceMatrixService();
      for (i = 0; i < model.markers.length; i += 1) {
        dest = model.markers[i].getPosition();
        dests.push(dest);
      }
      distServ.getDistanceMatrix(
        {
          origins: [origin],
          destinations: dests,
          travelMode: "WALKING"
        }, callback);
    } else {
        this.showHiddenMessage("Nope", "Please enter your location into the search bar, or click the map to drop a pin.");
      }
  },

  getDirections : function() {
    current = this.findMarker(currentProfile.id).getPosition();
    if (userLocation) {
      this.displayDirections(userLocation, current);
    } else {
      this.showHiddenMessage("Nope", "Please enter your location into the search bar, or click the map to drop a pin.");
      }
  },

  showByRating : function(rating) {
    //remove open circles/directions 
    directionsDisplay.setMap(null);
    if (circle) {
      circle.setMap(null);
    }
    //choose ratings list div and set  it to blank
    list = document.getElementById("ratingsFilterList");
    list.innerHTML = "";
    //iterate over restrooms and set locations 
    for (i = 0; i < model.restRooms.length; i += 1) {
      //comapre average rating of locatino to rating choice
      if (model.restRooms[i].avgRating >= rating) {
        //set marker visibilty of location to true if location ranks at or higher than rating
        viewModel.findMarker(model.restRooms[i].id).setVisible(true);
        //add loction name to list if ranking it at or higer than chosen rating
        idnum = model.restRooms[i].id;
        btn = document.createElement("BUTTON");
        txt = document.createTextNode(model.restRooms[i].title);
        btn.appendChild(txt);
        btn.setAttribute("id", idnum);
        btn.setAttribute("style", "width: 100%; background-color: #233044; color: #fdffb7; font-size: 20px; border: none; padding: 3%;");
        list.appendChild(btn);
        viewModel.addListListeners(idnum);
      } else {
        //set visibility to false if rating is below chasen rating 
        viewModel.findMarker(model.restRooms[i].id).setVisible(false);
        }
      if (list.innerHTML === '') {
        list.innerHTML = "No locations currently have that rating";
      }
    }
    //set source of elements with id values less than chose rating to clearBrush,
    // and at ot highger than rating to black Brush
    document.getElementById(rating).src = "images/blackBrush.png";
    for (i = 5; i >= 1; i --) {
      elem = document.getElementById(i);
      if (elem.id >= rating) {
        elem.src = "images/blackBrush.png";
      } else {
        elem.src = "images/clearBrush.png";
      }
    }
  },
  
  addWindowInfo : function (marker, placeInfo){
    placeInfo = new google.maps.InfoWindow();
    if (activeWindow) {
      activeWindow.close();
    }
    placeInfo.close(map, marker);
    //set all unclicked markers to null
    for (i = 0; i < model.markers.length; i += 1) {
      model.markers[i].setAnimation(null);
    }
    //check current marker to be sure it isn't alredy clicked
    if (placeInfo.marker != marker) {
      placeInfo.setMarker = null;
      activeWindow = placeInfo;
      //set marker content to current mark title
      placeInfo.setContent("<div>" + marker.title + "</div>");
      placeInfo.open(map, marker);
      //remove info window in closed
      placeInfo.addListener("closeclick", function(){
        placeInfo.setMarker = null;
      });
    }
  },

  displayAddForm: function() {
    if (addMarker) {
      this.showAddForm(true);
      this.showSubmitForm(true);
    } else {
      this.showHiddenMessage("Nope", "Please enter the location you would like to add");
    }
  },

  displayReviewForm: function() {
    console.log(currentProfile.title);
    box = document.getElementById("addPlaceInfo");
    title = document.createElement("h1");
    title.setAttribute("style", "color: #fdffb7;");
    title.innerHTML = currentProfile.title;
    box.appendChild(title);
    console.log(title);
    console.log(document.getElementById("hiddenReviewForm"));
    this.showReviewForm(true);
  },

  submitAddInfo: function() {
    if (addRating) {
      match = this.findRestroom(addResult.id);
      if (match === null) {
        reviewDraft = document.getElementById("addReview").value;
        rating = addRating;
        newRestroom = {
          title: addResult.name,
          reviews: [reviewDraft],
          rating: [rating],
          avgRating: rating,
          location: addMarker.getPosition(),
          id: addResult.id,
          details: addDetails
        };
        model.restRooms.push(newRestroom);
        console.log(newRestroom);
        console.log(addRating);
        this.createMarker(newRestroom);
        this.showSubmitForm(false);
        this.showAddForm(false);
        this.showHiddenMessage("OK", addResult.name + " has been added!");
      } else {
        this.showSubmitForm(false);
        this.showAddForm(false);
        this.showHiddenMessage("Nope", addResult.name + " is already a location. click the marker to review or Rate this location.");
      }
    this.clearField("addReview");
    if (userLocation) {
      userLocation.setVisible(false);
    }
    addRating = null;
  } else {
    this.showHiddenMessage('Nope', 'Please rate location before submitting.');
  }

  },

  submitReviewInfo: function() {
    prof = this.findRestroom(currentProfile.id);
    if (prof === null) {
      this.showSubmitForm(false);
      this.showAddForm(false);
      this.showHiddenMessage("Nope", "Sorry, something went wrong");
    } else {
      reviewDraft =  document.getElementById("revReview").value;
      prof.reviews.push(reviewDraft);
      prof.rating.push(addRating);
      prof.rating.push(rating);
      console.log(prof.rating);
      console.log(prof);
      this.showSubmitForm(false);
      this.showAddForm(false);
      this.showHiddenMessage("OK", "Your review has been added to" + prof.title);
    }
    this.clearField("revReview");
  },

  displayDirections: function(userLocation, destination){
    document.getElementById("directionsBox").innerHTML = "";
    directionsService = new google.maps.DirectionsService();
    if(directionsDisplay) {
      directionsDisplay.setMap(null);
      directionsDisplay = null;
    }
    directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directionsBox"));  
    origin = userLocation.getPosition();
    endPoint = destination;
    request = {
      origin : origin,
      destination: endPoint,
      travelMode: "WALKING"
    };
    directionsService.route(request, function(result, status) {
      if (status == "OK") {
        directionsDisplay.setDirections(result);
      } else if (status == "NOT_FOUND" || status == "ZERO_RESULTS") {
        viewModel.showHiddenMessage("Nope", "Unable to get directions for entered locations");
      }
    });
    viewModel.showDirections(true);
  },

  setAddRating : function (rating) {
    addRating = rating;
  },

  listLocations : function() {
    this.restroomsArray(model.restRooms);
    directionsDisplay.setMap(null);
    this.hideAllPopUps();
    this.showLocationsList(true);
  },

  getProfile : function (location) {
    viewModel.displayLocationProfile(location.id);
  },

  addListListeners: function(id) {
    btn = document.getElementById(id);
    btn.addEventListener('click', function(){
      viewModel.hideAllMarkers();
      viewModel.displayLocationProfile(id);
      mark = viewModel.findMarker(id);
      map.setCenter(mark.position);
      mark.setVisible(true);
    });
  },

  hideList : function() {
    this.showLocationsList(false);
  },

  hideProfile : function() {
    this.showLocationProfile(false);
  },

  clearField: function (field) {
    review = document.getElementById(field);
    if (review) {
      review.value = "";
    }
  },

  showHiddenMessage: function(response, message) {
    bar = document.getElementById("hiddenMessageBar");
    if (response === 'OK') {
      bar.style = "padding-top: 2%; background-color: #5d993b; color: #dbe5d5; width: 100%; height: 5%; float: center; position: relative; opacity: .9; text-align: center;";
      this.showMessage(message);
      this.showAddedMessage(true);
      setTimeout(viewModel.hideAllPopUps, 2000);
    } else {
      bar.style = "padding-top: 2%; background-color: #d84520; color: #dbe5d5; width: 100%; height: 5%; float: center; position: relative; opacity: .9; text-align: center;";
      this.showMessage(message);
      this.showAddedMessage(true);
      setTimeout(viewModel.hideHiddenMessage, 3000);
      }
  },
  
  hideHiddenMessage: function() {
    viewModel.showAddedMessage(false);
  },

  hideReviewForm : function() {
    viewModel.showReviewForm(false);
  },

  calculateRatingAvg : function(location) {
    rating = null;
    if (location.rating.length === 0) {
      rating = "Sorry, no one has offered any feedback yet.";
    } else if (location.rating.length === 1) {
      rating = location.rating[0];
    } else {
      sum = 0;
      for (i = 0; i < location.rating.length ; i ++ ) {
        sum += location.rating[i];
      }
      rating = (sum / location.rating.length);
      }
    if (typeof rating === 'string' || rating instanceof String) {
      return rating;
    } else if (rating < 2) {
      rating = "gross";
    } else if (2 >= rating && rating < 3 ) {
      rating = "kinda gross";
    } else if ( 3 >= rating && rating < 4) {
      rating = "fine";
    } else if ( 4 >= rating && rating < 5) {
      rating = "kinda clean";
    } else {
      rating = "clean";
    }
    return rating;
  },

  displayLocationProfile : function(id) {
    this.showDirections(false);
    this.showLocationProfile(true);
    mark = this.findRestroom(id);
    currentProfile = mark;
    this.profileName(mark.title);
    document.getElementById("moreInfoButton").setAttribute('value', mark.id);
    rating = this.calculateRatingAvg(currentProfile);
    this.profileRating("Users think it's : " + rating);  
    if (mark.reviews.length < 1) {
      viewModel.reviewsArray(["No reviews for this location yet."]);
    } else {
        viewModel.reviewsArray(mark.reviews);
    }
  },

  findRestroom : function(id) {
    for (i = 0; i < model.restRooms.length ; i ++) {
      if (model.restRooms[i].id === id ) {
        return model.restRooms[i] ;
      }
    }
    return null;
  },

  findMarker : function(id) {
    for (i = 0; i < model.markers.length ; i ++) {
      if (model.markers[i].id === id ) {
        return model.markers[i] ;
      }
    }
    return null;
  },

  setDrawingMap : function() {
    this.hideAllMarkers();
    this.hideAllPopUps();
    this.showFiltersBar(true);
    drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.CIRCLE,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.CIRCLE
        ]
      }
    });
  },

  searchArea : function() {
    for (i = 0; i < model.markers.length ; i ++) {
      if (google.maps.geometry.spherical.computeDistanceBetween(model.markers[i].position, circle.getCenter()) <= circle.getRadius()) {
        model.markers[i].setVisible(true);
      } else {
          model.markers[i].setVisible(false);
        }
    }      
  },

  searchWikiInfo : function(loc) {
    url = 'https://en.wikipedia.org//w/api.php?callback=?&action=opensearch&format=json&profile=fuzzy' +
    '&limit=1&uselang=en&prop=text&section=0&imageinfo&extracts&exintro=&explaintext&json&origin=*&iiprop=urll&search=';
    url += loc;
    $(document).ready(function(){
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(result) {
          if (result[2][0].length > 0) {
            viewModel.profileWiki(result[2][0]);
            viewModel.wikiLink(result[3][0]);
          } else {
            viewModel.profileWiki("No summary information is availble for this location. You may click the button below to check WikiPedia page.");
            viewModel.wikiLink(result[3][0]);
          }
        },
        error: function() {
          viewModel.profileWiki("Unable to reach WikiPedia servers at this time.");
        }
      });
    });
  },

  getGoogleImage: function(ref) {
    url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&key=AIzaSyCX8Zi0hHtFLV-g-yLo9QBOfFo3j_dNWsE&v=3&photoreference=";
    url += ref;
    return url;
  },

  displayMoreInfo : function() {
    viewModel.showMoreInfo(true);
    loc = document.getElementById('moreInfoButton').value;
    place = this.findRestroom(loc);
    this.profileName(place.title);
    this.profileAddress(place.details.formatted_address);
    moreImage = this.getGoogleImage(place.details.photos[0].photo_reference);
    this.detailsImage(moreImage);
    if (place.details.hasOwnProperty("photos")) {
      detailsImages = "images/clearBrush.png";
    }  
    if (place.details.hasOwnProperty("opening_hours")) {
      hours = place.details.opening_hours.weekday_text;
      this.hoursArray(hours);
    } else {
      this.hoursArray(["No hours information available for this location"]);
      }
    this.searchWikiInfo(place.title);
  },

  hideMoreInfo : function () {
    this.showMoreInfo(false);
    hours = null;
  }
};

var model = {
      markers : [],
      restRooms : [ 
        {title: "Whole Foods Market", 
        reviews: ["Pretty high-traffic, but kept realitvely clean for how busy this store can get!", "Only two stalls, so there's usually a line."], 
        rating: [4,5,4,3], 
        avgRating: 4, 
        location: { lat: 39.9629464, lng : -75.17414529999996}, 
        id: "24ad245c83f8bf1b6aca44fa537788135b6d4320", 
        details: {
          "address_components" : [
         {
            "long_name" : "2101",
            "short_name" : "2101",
            "types" : [ "street_number" ]
         },
         {
            "long_name" : "Pennsylvania Avenue",
            "short_name" : "Pennsylvania Ave",
            "types" : [ "route" ]
         },
         {
            "long_name" : "Center City",
            "short_name" : "Center City",
            "types" : [ "neighborhood", "political" ]
         },
         {
            "long_name" : "Philadelphia",
            "short_name" : "Philadelphia",
            "types" : [ "locality", "political" ]
         },
         {
            "long_name" : "Philadelphia County",
            "short_name" : "Philadelphia County",
            "types" : [ "administrative_area_level_2", "political" ]
         },
         {
            "long_name" : "Pennsylvania",
            "short_name" : "PA",
            "types" : [ "administrative_area_level_1", "political" ]
         },
         {
            "long_name" : "United States",
            "short_name" : "US",
            "types" : [ "country", "political" ]
         },
         {
            "long_name" : "19130",
            "short_name" : "19130",
            "types" : [ "postal_code" ]
         }
      ],
      "adr_address" : "\u003cspan class=\"street-address\"\u003e2101 Pennsylvania Ave\u003c/span\u003e, \u003cspan class=\"locality\"\u003ePhiladelphia\u003c/span\u003e, \u003cspan class=\"region\"\u003ePA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e19130\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUSA\u003c/span\u003e",
      "formatted_address" : "2101 Pennsylvania Ave, Philadelphia, PA 19130, USA",
      "formatted_phone_number" : "(215) 557-0015",
      "geometry" : {
         "location" : {
            "lat" : 39.9629464,
            "lng" : -75.17414529999999
         },
         "viewport" : {
            "northeast" : {
               "lat" : 39.9642420802915,
               "lng" : -75.17292211970847
            },
            "southwest" : {
               "lat" : 39.9615441197085,
               "lng" : -75.17562008029149
            }
         }
      },
      "icon" : "https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
      "id" : "24ad245c83f8bf1b6aca44fa537788135b6d4320",
      "international_phone_number" : "+1 215-557-0015",
      "name" : "Whole Foods Market",
      "opening_hours" : {
         "open_now" : true,
         "periods" : [
            {
               "close" : {
                  "day" : 0,
                  "time" : "2300"
               },
               "open" : {
                  "day" : 0,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 1,
                  "time" : "2300"
               },
               "open" : {
                  "day" : 1,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 2,
                  "time" : "2300"
               },
               "open" : {
                  "day" : 2,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 3,
                  "time" : "2300"
               },
               "open" : {
                  "day" : 3,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 4,
                  "time" : "2300"
               },
               "open" : {
                  "day" : 4,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 5,
                  "time" : "2300"
               },
               "open" : {
                  "day" : 5,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 6,
                  "time" : "2300"
               },
               "open" : {
                  "day" : 6,
                  "time" : "0700"
               }
            }
         ],
         "weekday_text" : [
            "Monday: 7:00 AM – 11:00 PM",
            "Tuesday: 7:00 AM – 11:00 PM",
            "Wednesday: 7:00 AM – 11:00 PM",
            "Thursday: 7:00 AM – 11:00 PM",
            "Friday: 7:00 AM – 11:00 PM",
            "Saturday: 7:00 AM – 11:00 PM",
            "Sunday: 7:00 AM – 11:00 PM"
         ]
      },
      "photos" : [
         {
            "height" : 3456,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/107548416420057554045/photos\"\u003evladimir karabin\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAd7GEajG79POsrPn4jNCgWrxsyMTBQN2dqh9PV68vPtUDNi2eX2xHU-GBv2u1nmOiBX12_2LVNwU31iv2ur48sMXSZRMvWbX-vCs50Ozd8yeUHnvb0FGk-cTVH_zo70QWEhBHqzhguiEM2lLrlcue4WFIGhT1f9n-0B1Lvn93PirD2mNkYcEyuQ",
            "width" : 4608
         },
         {
            "height" : 2988,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/100325262721276225099/photos\"\u003eGlenda Pacheco\u003c/a\u003e"
            ],
            "photo_reference" : "CmRZAAAAYwoRVNJwnWR4YjwMJAGUfZA0kO7vIGDEFzfwAr_zSM5nSu7sAsIYyaMcZr95fOva1sG5SafZDGnrBRJ2JWJWYppejo11UzrUO5z2Nd85JMZlKsK54Dctd75vYfdUmgjHEhD6RH9uj2qDygNr0CfGzaNXGhQmmZJ-YPcz40_IHeEnnHMczdsPaw",
            "width" : 5312
         },
         {
            "height" : 1836,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/112873919513134688047/photos\"\u003eMd Riad Mahmud\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAABsiDCiq6DfPOlXKplYDikc8Z8Qj0i7rU7WnrxzDowa_njH9iWL6lxKCs-HSXhL_KITZbhwPa79J2S2AbAxB4VrEeLwj0Jpqd3LDNMiKMYN4oofTXIbu9jZSKsYHptIBHEhBKwtf7LKnbG9Nrm_FWGqojGhTeKI0nD71jiDM8OUHInnOMYn2I_w",
            "width" : 3264
         },
         {
            "height" : 3024,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/109616655731272656818/photos\"\u003eNina Duong\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAhlQXVkmJJiPYMkWMmflWFLAtPAzk92BqPP9EBtDyDIM9KCqMYRq7s5nvzfG3I3QZW-buFlXY_PwpQsfvm3dYkcezLgfrCnZcEWkkJmGKbYswL5t3UzCJC4BVI9lbNg9OEhBKbczNaMxcqypB3fMffbOAGhSx_zRYsgImxLrksg7tFBd9jeeokQ",
            "width" : 4032
         },
         {
            "height" : 3024,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/112394126515599258145/photos\"\u003eCori Frede\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAA8uXxd1phNnsdDN_68AUWtNhXbU2uCOUzUBG8AZfPwgsV1F2YiNAJu51Xvj4fQ46u0whYrKME5gBa9PiOTbN2tdRt5jztNsXOVqzmk7rQcQF7yio_DEWIDyU4qFLI7BmEhA_uQR_I1kgBc7Wc1T6fZOgGhTnJCeODxzFJWXs6XxVUB80GhfAhQ",
            "width" : 4032
         },
         {
            "height" : 1836,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/112873919513134688047/photos\"\u003eMd Riad Mahmud\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAlF9pUwApmfNz-6vpa6bZIOohDP3t2ZkIzwDZAMWPemDDmwLT3kNx72z_1H0sLfV6BYl3wudgo7m_B8wrlCqE5GtvliRnYwPOQOj1doomizmSFWmh6a20LhPzJlSSr9gcEhCZEhmLxNYZ23Qa05478UiAGhQODbXg1god_dVwtCkQs0RHTAeHLQ",
            "width" : 3264
         },
         {
            "height" : 2448,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/118358029633987040579/photos\"\u003eKing Zamir\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAApAZEmdVm9bKoZfGMliqLnwyLsYyZANhinaSGN_7ylvdKqCozni7qp5Mbbf8tNQ-bhKHOs0ezWx62wo_RaU4_G64QE6X4jylLOp0PKgeU2uhhp_m1TET3_y0JqBx9VFS5EhCHP9HKFTqjAGQkE4ZwR-t8GhQwniSrWczJzjzfP54g7bu4TOmm9A",
            "width" : 3264
         },
         {
            "height" : 3120,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/111229835518241365502/photos\"\u003echarlotte laurent\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA6Xuq_a_FVidHI0XhiORQPZ9G2WnjzVT6uoNAU60bIKoOZjEz2koyumCBC0N06c7DQPb8ip3QtgiA3T8tTUSQxaDmLBb8JUir8ApF8QR63nSQihk1QSvrOpoWyYv-1QT0EhDZKKAnBbui73YFEakr2BDAGhQrcVmp7-T4gJPWtYLCuLKSQifkcQ",
            "width" : 4160
         },
         {
            "height" : 1836,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/112873919513134688047/photos\"\u003eMd Riad Mahmud\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAARirEXfxjqNQhGvg1F0OD5VVMNf4PBj_bBpyzwQmoVg5yIA75VettGqxqtTWUJyK5bwyZruyeB_GD-sH6TtsB2hps5_t3OlkcbIvmMye43vcbZEkqxKYzVVvc94Fcr6rEEhCOfTjJDBUhO5auyAz3w660GhSA6FbrujbPEZe2n7YmWLKuLZ3xLg",
            "width" : 3264
         },
         {
            "height" : 3024,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/116384529540900479588/photos\"\u003eNANCY O&#39;DONNEL\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA73P1BIrO9EYFEhnjsOdSQPjbz4MhdQiL8eG7d5d8b9ONDzZCnyjDEn_6tXl7_v1sUsIP043GlNh5HDgmPAgI1TYU4X_lwvY5GfIV5SDAut9b598znBAnz7bPCfCjmY_zEhBS8fBjnHxmiJrMOIJ9wJUqGhTTIb68bqlRMuST9vSGe2MKwjgN0g",
            "width" : 4032
         }
      ],
      "place_id" : "ChIJK8SSXMvHxokRshAWXMetwrQ",
      "price_level" : 2,
      "rating" : 4.5,
      "reference" : "CmRSAAAANQALpE9nChtCy6NMkC8VqqhmcF8vIe-FeKU_de_rBoEEUFK1NEejuXT3DKs9XwL7blnIjRda_zRgT2inF1Xteh5L7DXi40KuUvnCyeIcgK-tkXBFDPP7mF8jO_7p6ITWEhBMxwrBNtPIBMWf7MTPh8A4GhTla79BKn6KKtnhcOCdKISG_bYgWg",
      "reviews" : [
         {
            "author_name" : "Kevin Mandell",
            "author_url" : "https://www.google.com/maps/contrib/115293345469621349291/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/--sRG6sCWqL4/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePYwYtosGP5a7H6lr--Gz4MdmDFSbA/s128-c0x00000000-cc-rp-mo-ba3/photo.jpg",
            "rating" : 3,
            "relative_time_description" : "in the last week",
            "text" : "As a Whole Foods market, of course you will find quality food and other items. This location is unattractive and has the feel of a large warehouse. The staff are mostly young and typical \"friendly because I was trained to be\" types. The layout makes no sense, but I suppose if you shop there frequently it is easier to navigate. And what is with having to climb stairs or take an elevator to get to the main floor for shopping? It makes me wonder what was in the building previously or if the store was built this way on purpose from the ground up.",
            "time" : 1508176632
         },
         {
            "author_name" : "ashire davis",
            "author_url" : "https://www.google.com/maps/contrib/115810217888478578783/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-WRwfAETMx28/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePZMJfKkGinIY611dlWpfLDa02o55w/s128-c0x00000000-cc-rp-mo/photo.jpg",
            "rating" : 4,
            "relative_time_description" : "a week ago",
            "text" : "Nice clean environment.  So many choices of food. There is a Hot food section with vegan options. There is also a soup bar which I love 😍. The Staff is friendly. You can even watch the cooks prepare your food. The parking is free underground  but is small make sure you come early for a spot. I definitely will be returning.",
            "time" : 1507836110
         },
         {
            "author_name" : "Abdullah Almalki",
            "author_url" : "https://www.google.com/maps/contrib/103393120379938423300/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-H9x4PH7SQIE/AAAAAAAAAAI/AAAAAAAAAGQ/5KGfgq8Vb7M/s128-c0x00000000-cc-rp-mo-ba5/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "a week ago",
            "text" : "This place has everything for everyone! It's magnificent! The mini food court is what won me over. It is filled with DELICIOUS foods in such a variety.They have samples throughout the store a lot which is awesome!! Really cool place to go.",
            "time" : 1507759519
         },
         {
            "author_name" : "a",
            "author_url" : "https://www.google.com/maps/contrib/110080040043272318279/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-P2Pr_mTobUw/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePYfMGNYxWBQr1EQacex39WFtX719w/s128-c0x00000000-cc-rp-mo/photo.jpg",
            "rating" : 1,
            "relative_time_description" : "2 weeks ago",
            "text" : "Worst whole foods ever. We went on sunday, and at least half of the shelves were literally bare. I asked what was going on and the cashier told me it was a \"shipping issue\" that they were \"working to rectify\". He was very nice and helpful. My biggest complaint however is a transparent butcher shop directly next to produce. I understand the desire for transparency and connectedness regarding the animals some people eat, but the location within the store is unfortunate, to say the least. It's in the produce section. Like, why??? You cant grab some mushrooms without seeing splayed carcasses and entire animals hanging on hooks mere feet away, impossible not to view. Major, major design flaw, and one that will keep from shopping at this location all together.",
            "time" : 1506985128
         },
         {
            "author_name" : "IC Harris",
            "author_url" : "https://www.google.com/maps/contrib/102236305290747562663/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh6.googleusercontent.com/-gnI_4kr_XoM/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePbPLyi6XIrt3OURiNY9FZ_oAzcjnA/s128-c0x00000000-cc-rp-mo/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "a month ago",
            "text" : "Love the variety. People say a bit costly but the sales are not bad. One stop shop, is phenomenal. Especially when options are less toxic. Since Amazon is taking over, I have experienced a price cut organic Fuji apples 2.49 lb drop to 1.99 lb, not bad!! Looking forward how this take over will effect the consumer shopping experience. Heard Amazon's strategy, hats off if they stick to consumer first 😉",
            "time" : 1504325913
         }
      ],
      "scope" : "GOOGLE",
      "types" : [
         "grocery_or_supermarket",
         "health",
         "food",
         "store",
         "point_of_interest",
         "establishment"
      ],
      "url" : "https://maps.google.com/?cid=13025164144063942834",
      "utc_offset" : -240,
      "vicinity" : "2101 Pennsylvania Avenue, Philadelphia"
   },
   "status" : "OK"
},
        {title: "Barnes and Noble", 
        reviews: [], 
        rating: [3,2,3,4], 
        avgRating: 3, 
        location: {lat : 39.9503388,lng : -75.17100569999999}, 
        id: "5c8cf4e4da45ca5937b91d9eebf98b4686a98dcb", 
        details: {
      "address_components" : [
         {
            "long_name" : "1805",
            "short_name" : "1805",
            "types" : [ "street_number" ]
         },
         {
            "long_name" : "Walnut Street",
            "short_name" : "Walnut St",
            "types" : [ "route" ]
         },
         {
            "long_name" : "Center City",
            "short_name" : "Center City",
            "types" : [ "neighborhood", "political" ]
         },
         {
            "long_name" : "Philadelphia",
            "short_name" : "Philadelphia",
            "types" : [ "locality", "political" ]
         },
         {
            "long_name" : "Philadelphia County",
            "short_name" : "Philadelphia County",
            "types" : [ "administrative_area_level_2", "political" ]
         },
         {
            "long_name" : "Pennsylvania",
            "short_name" : "PA",
            "types" : [ "administrative_area_level_1", "political" ]
         },
         {
            "long_name" : "United States",
            "short_name" : "US",
            "types" : [ "country", "political" ]
         },
         {
            "long_name" : "19103",
            "short_name" : "19103",
            "types" : [ "postal_code" ]
         },
         {
            "long_name" : "4727",
            "short_name" : "4727",
            "types" : [ "postal_code_suffix" ]
         }
      ],
      "adr_address" : "\u003cspan class=\"street-address\"\u003e1805 Walnut St\u003c/span\u003e, \u003cspan class=\"locality\"\u003ePhiladelphia\u003c/span\u003e, \u003cspan class=\"region\"\u003ePA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e19103-4727\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUSA\u003c/span\u003e",
      "formatted_address" : "1805 Walnut St, Philadelphia, PA 19103, USA",
      "formatted_phone_number" : "(215) 665-0716",
      "geometry" : {
         "location" : {
            "lat" : 39.9503388,
            "lng" : -75.17100569999999
         },
         "viewport" : {
            "northeast" : {
               "lat" : 39.9516171302915,
               "lng" : -75.16970166970849
            },
            "southwest" : {
               "lat" : 39.9489191697085,
               "lng" : -75.17239963029151
            }
         }
      },
      "icon" : "https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
      "id" : "5c8cf4e4da45ca5937b91d9eebf98b4686a98dcb",
      "international_phone_number" : "+1 215-665-0716",
      "name" : "Barnes & Noble",
      "opening_hours" : {
         "open_now" : true,
         "periods" : [
            {
               "close" : {
                  "day" : 0,
                  "time" : "2000"
               },
               "open" : {
                  "day" : 0,
                  "time" : "1000"
               }
            },
            {
               "close" : {
                  "day" : 1,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 1,
                  "time" : "0900"
               }
            },
            {
               "close" : {
                  "day" : 2,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 2,
                  "time" : "0900"
               }
            },
            {
               "close" : {
                  "day" : 3,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 3,
                  "time" : "0900"
               }
            },
            {
               "close" : {
                  "day" : 4,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 4,
                  "time" : "0900"
               }
            },
            {
               "close" : {
                  "day" : 5,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 5,
                  "time" : "0900"
               }
            },
            {
               "close" : {
                  "day" : 6,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 6,
                  "time" : "0900"
               }
            }
         ],
         "weekday_text" : [
            "Monday: 9:00 AM – 10:00 PM",
            "Tuesday: 9:00 AM – 10:00 PM",
            "Wednesday: 9:00 AM – 10:00 PM",
            "Thursday: 9:00 AM – 10:00 PM",
            "Friday: 9:00 AM – 10:00 PM",
            "Saturday: 9:00 AM – 10:00 PM",
            "Sunday: 10:00 AM – 8:00 PM"
         ]
      },
      "photos" : [
         {
            "height" : 2304,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/110320193133709340402/photos\"\u003e羅玉容\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAfAykD3TMEX75rnhzlbjShJBaaCnlX-rx-P51Q1xJSAwfgx6aeOnhfr5f5gC_h0PTg3FeKCkVqwNEykX16hf1kw938DWt3P0sjS8F8MX8OFnn1TFtsdUA19h5tr51sT7MEhAvfWjjsVH3lG5w0tfy5v-yGhQkYimhZ4diSRsDfLNDn091IbD8VA",
            "width" : 4096
         },
         {
            "height" : 2340,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/100185739421664471933/photos\"\u003eAlejandro Soifer\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA3iyW-IP-Kpj3-V-BQpevRf_qHdBFVvWQ-8dC6hnoYvU8RysXE399sziWNO2lmkY3jZHDG-D7yxJW1IHnppNfvL-41gHKujRZcsIbWDRbD9ceFw_Bw6F_XA2BjLP00kM1EhAcc6EQPh0h0TYYJYTs35qdGhRjHlTvGzp-NROKJ091arz_ZeuCfA",
            "width" : 4160
         },
         {
            "height" : 2988,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/114375897732572954168/photos\"\u003eHari Kumar\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA5QXaI5ETTGNDDEER44xwWj-Pv0oFOHLglFWLEiUhZpwcukV4GhHRRT-Nh-cRVlJxN8ittv-OIUqH4KcyxZd6APUZnNS6G5SwPsZY2Ep_b6rlCiTCOEDp3YF6VQpkl1XHEhBq47ZjylmK5ahzH_0a_4YwGhT2vnebPL2iBrGc26eUCGCIJExZOA",
            "width" : 5312
         },
         {
            "height" : 2995,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/117453751448974090039/photos\"\u003eSam Ling\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAALDv9GZTC45vwo3BVxpLa1Rf6__3ak59T8A9sfOEIMsuml0P6gAhVkXEM6bFFe7eA_33B0k_6mY_2k6oNkPCpRVBiz15D9ScOvOOlZyaImpDcrOxbmm6lbSQH83GGI72dEhBsQNcB5f9nOwQFcHHcoBs8GhQakaUZzpKItQ0o7Lj8HGhzcxJd5w",
            "width" : 3993
         },
         {
            "height" : 4373,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/117043117783947416633/photos\"\u003eDimitrios Spyropoulos\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAnOe0jRslOv82KYg16W2UznxkZDDnbZKnOVW07UDiAELZNuXUpf0U1pQArbIHOCX2tG4VX_NrB1j8jzpWp2PzffvHuRRwXIXiLnPqICRgayfzK98BkAtz9rlKzJ5TY9pBEhCmREGKSMN9HXCl1uvGWiheGhRE6ENGZ2AsfZqIcAxnE7B0g-buYw",
            "width" : 2915
         },
         {
            "height" : 2988,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/115888204414065875095/photos\"\u003eDavid Huang\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAZ2ECmtJDMzp5hx0ummdqYWoCh6L-NXY0C_P5CDcwOPkDtNxxDi6UjHgKUtMPjYCp30OwvH-nC32Nq7Q2wi6NVxF5dcJBiHK9gBDN4sj0rrcZfAdeQzmROefNqlTe1R5yEhCh5LAP-27_dBg4OdxAn5xqGhSgICc4zIsCsPvMO6Y9gZSck3cyKA",
            "width" : 5312
         },
         {
            "height" : 2304,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/110320193133709340402/photos\"\u003e羅玉容\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAUOCQOevjbR6R2etq4rOWeEz8mBoEPFWcoew4e6wH8mKDmMrWU9snJPyN4FT2orvvS07gVqtNDt-MJNE8MnFF_NWMyGQg-apZFrbFerdFCAxjz4g7Ba-B0PhSEzigXKIpEhD_Q8nwmVGe7Y94n3fCgXczGhQ5DoVOur0iYuRNjxOrNSJ_dPmaAw",
            "width" : 4096
         },
         {
            "height" : 2560,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/100174197535304390472/photos\"\u003eRich Ruszkowski\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAtaBoD5Vw5KqejeLLsAGQK72BTF10uwD3bKs07dwB190Ak_hSkmaO21royzPozQKk4HyReP_0h5hgfN-YzMSPH_XkVVt3YDy7QyFnhnmuzonhvO1YBpSrp9pL6AW_QJg4EhCT9tKgZ5_UAE4VTLjmrA0dGhSliyM2ITCd-KaZ1Rl9iZMfxrgkqg",
            "width" : 1440
         },
         {
            "height" : 2988,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/115888204414065875095/photos\"\u003eDavid Huang\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAi7BBwHFKabd1xGagpcw9W2VLSHIq7Bo-lHHW9qeTVqxV0l6tAZRhkJQHizj9gwLMBvz1n7yhfKCHj3gP-AVoQQ3S7RQXp1RgK967rZv3w647WLzHOZoOQF2yJYpLttfTEhDi7u32ZT4zZf4Ixmy_mUlYGhR5dDsC-0fiofgP1Rq6lSW-POyz8A",
            "width" : 5312
         },
         {
            "height" : 2988,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/114375897732572954168/photos\"\u003eHari Kumar\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAQFXa60QT13eS1yJFveg48kPv20mlezVFhS6wZIgNihUyYMAunbJUZvC8WDa5Ui8EUy7KjYh5ybfCktt56iNJSOyQNWFpIkzOipuJy6IqIdlAIX_7gTHtQoidHkzfi1hIEhCbVOb1aCLLx2TXRhrnUs9WGhQ6R5Mv4vwt5O0Aaotk4Zw8Iw8lFw",
            "width" : 5312
         }
      ],
      "place_id" : "ChIJyST8CTrGxokRXPobOd5Irz4",
      "price_level" : 2,
      "rating" : 4.4,
      "reference" : "CmRRAAAAY_2KzBofNPK_J1cA9_MSvBQEPQjst8OhbDsdWQoUH_5knZYanfhu8Leqj2HxdzmOLpB5WFdd6VkT_DzfkPJ2y3OxzRtBumUWJvA2ho-pqQYJZY2sNG8F_CVOHreMjatgEhC701lOIVx3pBO4WDT6JfbXGhSKQjIaE00OsOY0TxaAmUH_IdvxDg",
      "reviews" : [
         {
            "author_name" : "Courtney P",
            "author_url" : "https://www.google.com/maps/contrib/107685766979062233819/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-nDCCB6CqN-g/AAAAAAAAAAI/AAAAAAAAE_4/WDSGKidDY_E/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "5 months ago",
            "text" : "Love this B&N location. Convenient by foot from most Center City locations. There is always a security guard stationed at the front door who provides a warm greeting. The multiple levels and sections are clearly defined and the cafe has plenty of space for a large group of customers to sit, read and/or eat. The staff have been very helpful in my visits there.",
            "time" : 1495544331
         },
         {
            "author_name" : "Michael E. Bell",
            "author_url" : "https://www.google.com/maps/contrib/106734241899950139243/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/-sjPRMasfytA/AAAAAAAAAAI/AAAAAAAAAbo/nv6GFhAyxbE/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg",
            "rating" : 3,
            "relative_time_description" : "3 weeks ago",
            "text" : "This is my next favorite place to Rittenhouse Square.  The magazine selection is the Best. The Starbucks on the 2nd floor adds to the ambience.  No parking but most people probably live in walking distance.",
            "time" : 1506535332
         },
         {
            "author_name" : "Cynthia Kolb",
            "author_url" : "https://www.google.com/maps/contrib/106493928522999852909/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/-RxcK3lW6nIQ/AAAAAAAAAAI/AAAAAAAAAU0/qVFdV4tF_j0/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "4 weeks ago",
            "text" : "Great store...looks just like every other one. Cashier's a little chilly , but information desk guy very helpful.",
            "time" : 1506032431
         },
         {
            "author_name" : "Vincent",
            "author_url" : "https://www.google.com/maps/contrib/106495243207215200490/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/-k8kYp2fzA2I/AAAAAAAAAAI/AAAAAAAAAaI/9LoF0gMvg5w/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "a month ago",
            "text" : "Great place to visit if you are trying to buy a book or just hanging out. The store is right in center city and across the street from Rittenhouse Square. Staff here is very friendly and helpful when you are looking for a specific book. They have a Starbucks cafe on the 2nd level with free wifi, you can sit there and read your books.",
            "time" : 1505160943
         },
         {
            "author_name" : "Aaron G",
            "author_url" : "https://www.google.com/maps/contrib/114446785556521356266/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/-X_wxBoa5Se4/AAAAAAAAAAI/AAAAAAAA_vc/PxQHMEATG5A/s128-c0x00000000-cc-rp-mo-ba5/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "a month ago",
            "text" : "Fun place to visit. The cafe on the second floor is good. Very friendly and helpful service",
            "time" : 1503683394
         }
      ],
      "scope" : "GOOGLE",
      "types" : [ "book_store", "store", "point_of_interest", "establishment" ],
      "url" : "https://maps.google.com/?cid=4516909070553971292",
      "utc_offset" : -240,
      "vicinity" : "1805 Walnut Street, Philadelphia",
      "website" : "https://stores.barnesandnoble.com/store/2850"
   },
   "status" : "OK"
},
        {title: "Macy's", reviews: [], rating: [3,3,2,2], avgRating: 2.5, location: {lat : 39.951903,lng : -75.16179500000001}, id: "13a0e0cc16df261c35742d90a017a94944254c1a", details: {

      "address_components" : [
         {
            "long_name" : "1300",
            "short_name" : "1300",
            "types" : [ "street_number" ]
         },
         {
            "long_name" : "Market Street",
            "short_name" : "Market St",
            "types" : [ "route" ]
         },
         {
            "long_name" : "Center City",
            "short_name" : "Center City",
            "types" : [ "neighborhood", "political" ]
         },
         {
            "long_name" : "Philadelphia",
            "short_name" : "Philadelphia",
            "types" : [ "locality", "political" ]
         },
         {
            "long_name" : "Philadelphia County",
            "short_name" : "Philadelphia County",
            "types" : [ "administrative_area_level_2", "political" ]
         },
         {
            "long_name" : "Pennsylvania",
            "short_name" : "PA",
            "types" : [ "administrative_area_level_1", "political" ]
         },
         {
            "long_name" : "United States",
            "short_name" : "US",
            "types" : [ "country", "political" ]
         },
         {
            "long_name" : "19107",
            "short_name" : "19107",
            "types" : [ "postal_code" ]
         }
      ],
      "adr_address" : "\u003cspan class=\"street-address\"\u003e1300 Market St\u003c/span\u003e, \u003cspan class=\"locality\"\u003ePhiladelphia\u003c/span\u003e, \u003cspan class=\"region\"\u003ePA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e19107\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUSA\u003c/span\u003e",
      "formatted_address" : "1300 Market St, Philadelphia, PA 19107, USA",
      "formatted_phone_number" : "(215) 241-9000",
      "geometry" : {
         "location" : {
            "lat" : 39.951903,
            "lng" : -75.16179500000001
         },
         "viewport" : {
            "northeast" : {
               "lat" : 39.95340223029149,
               "lng" : -75.1605746697085
            },
            "southwest" : {
               "lat" : 39.9507042697085,
               "lng" : -75.1632726302915
            }
         }
      },
      "icon" : "https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
      "id" : "13a0e0cc16df261c35742d90a017a94944254c1a",
      "international_phone_number" : "+1 215-241-9000",
      "name" : "Macy's",
      "opening_hours" : {
         "open_now" : true,
         "periods" : [
            {
               "close" : {
                  "day" : 0,
                  "time" : "1900"
               },
               "open" : {
                  "day" : 0,
                  "time" : "1100"
               }
            },
            {
               "close" : {
                  "day" : 1,
                  "time" : "2000"
               },
               "open" : {
                  "day" : 1,
                  "time" : "1000"
               }
            },
            {
               "close" : {
                  "day" : 2,
                  "time" : "2000"
               },
               "open" : {
                  "day" : 2,
                  "time" : "1000"
               }
            },
            {
               "close" : {
                  "day" : 3,
                  "time" : "2000"
               },
               "open" : {
                  "day" : 3,
                  "time" : "1000"
               }
            },
            {
               "close" : {
                  "day" : 4,
                  "time" : "2000"
               },
               "open" : {
                  "day" : 4,
                  "time" : "1000"
               }
            },
            {
               "close" : {
                  "day" : 5,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 5,
                  "time" : "0900"
               }
            },
            {
               "close" : {
                  "day" : 6,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 6,
                  "time" : "0900"
               }
            }
         ],
         "weekday_text" : [
            "Monday: 10:00 AM – 8:00 PM",
            "Tuesday: 10:00 AM – 8:00 PM",
            "Wednesday: 10:00 AM – 8:00 PM",
            "Thursday: 10:00 AM – 8:00 PM",
            "Friday: 9:00 AM – 10:00 PM",
            "Saturday: 9:00 AM – 10:00 PM",
            "Sunday: 11:00 AM – 7:00 PM"
         ]
      },
      "photos" : [
         {
            "height" : 2988,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/107848138167354503389/photos\"\u003eNorael Layne\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAuRSA-J7pLgGuWbV1O6VTS1CKOQIoM4W8G5H7Q5Ocu9wLYGRHLZd8Uzr7EnEEfsrE4Odm0DdXGMb8OHsnw01TegNgASwGkSuya94hepdlXZE2vsoQQP2dvfqPgM5KX9N2EhDabLlXdwnIu3cQHmWeCgSgGhS2u7DCD8s3GPJQgGmPO0Fxp1Qxyw",
            "width" : 5312
         },
         {
            "height" : 972,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/115507822679372745807/photos\"\u003eWilliam Kerwin\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA8RNL5pQdFPObo29Qna0kJiIcs2ACKh1XzwHRfwwQgkwPY7kgLzBQ3Gx1aMv0KoowjR0LiURoGAvUPwfy72EoDWLlhcmm8eNwgOUQBNwWXxlImGl_5KjO7pjCxo16aMqBEhCP9zG_hYEIDOzFV_OkVptaGhQwniyDnF3xMi2GtTmumk-AleA2lQ",
            "width" : 1296
         },
         {
            "height" : 2319,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/106838567400893949749/photos\"\u003eAlex Widjaksono\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA7pcCQLsQobJ3yQ2HVetc5uNy_RJ372agUKdm8_gwJ3jjdhM5cOLk7ERlL1GGXk2mfxB-y6B4MqrM1aio2-dTFLbph-7bD01dhEgk-EJl3QRA97IJUPDyDWdbmIicL8lOEhCBzcGgzQgAa4IIehJWNR4sGhR04KEQfFrKf01SARp1F1w0w94eJg",
            "width" : 6897
         },
         {
            "height" : 2762,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/104447333329607702220/photos\"\u003eDavood A\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAAin1m8ObI9HKmSbe89GkBOTEbpx0yc18oASlSFyG2ho-ppxqf8w4W0ppvXZWly4XHdRmNgIC19Ev3L-sELV2LQhGUQRLpNAToatx3NuCzPm_ixz1LlHSySbM_E-ocHJhEhBhAKbb-mOlS1KQqKmNbOFLGhRUOZ45LoanWLm42ncbxjiZIUvtjA",
            "width" : 2447
         },
         {
            "height" : 2988,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/108718645873609326948/photos\"\u003eDavid Syracuse\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAxjSZWvzJzUgw1YYLOGd8GglL0cErWtm3MI8qMmApzu4cNLS94LZB2RrPpg-sCe2-Hf-FL_U1Zwbckl7hi7QbhtN4VrK67c3F3uwAE2aXrVOs6X6chCznGQjEn2nyXW4sEhDGctxI8R3qggc-t-4aMRbEGhSxGVr-J_kwLdkNkpNGmSXEhoWXqw",
            "width" : 5312
         },
         {
            "height" : 720,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/106071613533381656186/photos\"\u003eJorge Hernandez\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAqzr7ns6C2DltU7ptqa6rqZOrTiH8R41Cty8qwmCvzTbp7OJvIi0vXowh0Wn1qY2xLubphBhU3EzObHvwuOSZpMo8e6rdC-MNF9kLgJt6jaqYNPhMbch70g-aocg_02RYEhDTOImhU1kUokhFL3j25dR1GhRh7vrxTMwDm-SE9fOgL1DyunKkBQ",
            "width" : 1280
         },
         {
            "height" : 4032,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/118146534576126364529/photos\"\u003eAshley Murphy\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAARvvHC5bf9GVn3vcRLqBm42Nv74M_aRnXYcEBcHoqtl4p_3G0zq-8axiShfrjcaMX1NITl-AFGVbKaPTxDDR2PCfNRa3lnxKFG-xc-qaFHOtmxjey17-FC2Bi212yBp3-EhCgLvtXKGl9ixuXfPGzumP_GhSCvoK4sAUypOo7eg-tmm49AeKFRw",
            "width" : 3024
         },
         {
            "height" : 2592,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/117304541422133773130/photos\"\u003eAlok\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAc5Jxk_cIrd5wu7Igqg6fp5KneIJvma6Xk_Arz-sfmQgN-f656QCDXiK3GukFeno18JxaPVT6TlaFliowCaReNEjWqtkcrHdw1RS5GDjyiIj7C-NSezMozpxpBsyWr5dTEhA9a9xCH6TKZvDAYSMzfR_LGhRj65dFjck50kqFsYkI4ciSrv9lcg",
            "width" : 4608
         },
         {
            "height" : 3264,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/111277410118167762245/photos\"\u003eKamia Mwango\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAT_yyNHB7PKoILAaHBhLQ6Ew83hCMwajcv5uFcGbt4RM5ocEu4y91FLT1PgDZnCwnftarzX79twgOGJceFq7jDm6Z7Aj4epFzjAj_8ACzdrxGWTwYFrUtzorbaIVbq_dEEhARJ8feQQunPWtpS3usY4vvGhT5qZClSWua36yVj_yUpTZLgVA7HQ",
            "width" : 1836
         },
         {
            "height" : 2340,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/112974451474888591559/photos\"\u003eJeremiah Weed\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA9GJAPJEU5MoSOTE059hg-Dve-v886n_J3GdvtF1Gf5uMoK2ZMGzv5HGHzXZzDg6bf90zzH4l9613RfVSZNtj6WqFlpndq98ZnQT4FfsmnsqCvEsRloeV_9CUFeLL0NnJEhA3imTlORw1kep2BOycgwyOGhS1lrQjBLYV9SXP-9f3SnkL_ROhkA",
            "width" : 4160
         }
      ],
      "place_id" : "ChIJK-tvHi_GxokRNZn0yGGW6l8",
      "price_level" : 2,
      "rating" : 4.2,
      "reference" : "CmRRAAAAaKIjAjmFtmNwLbvykDXbqSlSUAWPRmAh9QWzi2xH1z1ZayzeXN4-ekr_9rTfFsxUoLrQtjWeMnqX2T1iIeH8nS0JbuxQzUWsGsjeD3-NR3mLbXbDsjM2UIdS0vLA9pM1EhCRu1sL5tg5WaoZT5sENWecGhQX1Y33xvZ5f4lCDQ_kYhE5DZoIRg",
      "reviews" : [
         {
            "author_name" : "Quan Le",
            "author_url" : "https://www.google.com/maps/contrib/106039788106377602384/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-WapgqubUmoA/AAAAAAAAAAI/AAAAAAAAAAo/tIAvNSc-QpU/s128-c0x00000000-cc-rp-mo-ba3/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "3 weeks ago",
            "text" : "A great Macy's store that brought to us, Floridian tourists, the real Christmas atmosphere. The store is located inside the historic Wanamaker building in the middle of Philly, but we could park our car in the street in front of the building without any charge. The architecture is vintage, and the decor here is beautiful and lovely. We coincidentally came here to only get some outerwear for the Northeast trip to New York and Massachusetts. Yet we have never known before that it has an annual Christmas light show, Holiday Pageant of Lights Christmas Show and The Dickens Village, that thoroughly impresses and surprises us. More importantly, they are all free access to everyone. Overall, free parking (if you are lucky enough), free amazing live piano, free light show experience, and so many things else to discover; it is simply 5 stars. It should also be noted as a tourist attraction along with just a department store. Merry Christmas and Happy New Year!",
            "time" : 1506460494
         },
         {
            "author_name" : "Kevin Mandell",
            "author_url" : "https://www.google.com/maps/contrib/115293345469621349291/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/--sRG6sCWqL4/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePYwYtosGP5a7H6lr--Gz4MdmDFSbA/s128-c0x00000000-cc-rp-mo-ba3/photo.jpg",
            "rating" : 3,
            "relative_time_description" : "3 weeks ago",
            "text" : "When it was the original John Wanamaker's, this store was better organized, had a more refined and pleasant atmosphere, and had a better selection of clothing. When it was sold and became Lord & Taylor, things started to decline. Now as Macy's, and I am focusing mainly on the Men's Department, the layout is unattractive and the atmosphere kind of \"blah\". The staff generally seem a little cold. The selection of clothing is inferior to what is available online. \nThe best things about this store are the frequent sales, the pipe organ, the Christmas show, the historic Eagle Statue which they had the good sense to keep, and the generally clean and spacious men's restroom  (a Godsend if you need to \"go\" and don't want to be questioned or harassed).\nOh, but what is the deal with the sinks in the men's restroom with faucets that only run for ten seconds or less? Who had the idea that is long enough to soap and rinse your hands? You end up having to press the button at least two or three times to actually get the job done!",
            "time" : 1506210221
         },
         {
            "author_name" : "Julianne Lilholt",
            "author_url" : "https://www.google.com/maps/contrib/101639420806563771846/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-RwH1pQZ6YKE/AAAAAAAAAAI/AAAAAAACMWc/qZ6czuV8ns0/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg",
            "rating" : 2,
            "relative_time_description" : "in the last week",
            "text" : "I went it here to buy a coat because it was colder than I expected and I was freezing. It took forever and going to every floor and walking everywhere to figure out where they were. They should have a map of the different sections. Then once I finally found the Northface items, I couldn't find anyone to check me out!! I went to every floor trying to find someone to take my money! If I didn't really need the coat to continue my day outside, I would have put my stuff back and left without buying anything. I usually really like Macy's stores, too; it was just this location I would never choose to go to again.  I do have to say, every man at the entrances and exits were very friendly though.",
            "time" : 1508355487
         },
         {
            "author_name" : "Angel Hogan",
            "author_url" : "https://www.google.com/maps/contrib/105021593758691622577/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-xIhGRPKP5Go/AAAAAAAAAAI/AAAAAAAAFfI/8jNNPPSd8Zc/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "a week ago",
            "text" : "Wonderful gentleman gave great help at the men's fragrance counter. \"Old school\" advice and assistance. Wish I remembered his name. Really good salesperson. Appreciated.",
            "time" : 1507580057
         },
         {
            "author_name" : "Lindy Mnikathi",
            "author_url" : "https://www.google.com/maps/contrib/111529632260592212249/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-qPPWVK_7WRU/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePb2AMlo8XciHtaE1EVSFg-Ors5oEg/s128-c0x00000000-cc-rp-mo-ba2/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "a month ago",
            "text" : "I have to say I'm very pleased with Macy's. Their women under wear department is a bliss. The staff is awesome & very helpful. You can try as many items as like & their return policy of 12 months is unbelievable satisfying.",
            "time" : 1503993279
         }
      ],
      "scope" : "GOOGLE",
      "types" : [
         "department_store",
         "shoe_store",
         "jewelry_store",
         "clothing_store",
         "furniture_store",
         "home_goods_store",
         "store",
         "point_of_interest",
         "establishment"
      ],
      "url" : "https://maps.google.com/?cid=6911501924880914741",
      "utc_offset" : -240,
      "vicinity" : "1300 Market Street, Philadelphia",
      "website" : "https://l.macys.com/philadelphia-pa"
   },
   "status" : "OK"
},
        {title: "National Constitution Center", 
        reviews: [], 
        rating: [5,4,5,5], 
        avgRating: 4.75,
        location: { lat: 39.9538916, lng : -75.14906559999997}, 
        id: "c0fe170c2579a8d23f42bb3bc002ebe064d5096b", 
        details: {
      "address_components" : [
         {
            "long_name" : "525",
            "short_name" : "525",
            "types" : [ "street_number" ]
         },
         {
            "long_name" : "Arch Street",
            "short_name" : "Arch St",
            "types" : [ "route" ]
         },
         {
            "long_name" : "Center City",
            "short_name" : "Center City",
            "types" : [ "neighborhood", "political" ]
         },
         {
            "long_name" : "Philadelphia",
            "short_name" : "Philadelphia",
            "types" : [ "locality", "political" ]
         },
         {
            "long_name" : "Philadelphia County",
            "short_name" : "Philadelphia County",
            "types" : [ "administrative_area_level_2", "political" ]
         },
         {
            "long_name" : "Pennsylvania",
            "short_name" : "PA",
            "types" : [ "administrative_area_level_1", "political" ]
         },
         {
            "long_name" : "United States",
            "short_name" : "US",
            "types" : [ "country", "political" ]
         },
         {
            "long_name" : "19106",
            "short_name" : "19106",
            "types" : [ "postal_code" ]
         }
      ],
      "adr_address" : "\u003cspan class=\"street-address\"\u003e525 Arch St\u003c/span\u003e, \u003cspan class=\"locality\"\u003ePhiladelphia\u003c/span\u003e, \u003cspan class=\"region\"\u003ePA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e19106\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUSA\u003c/span\u003e",
      "formatted_address" : "525 Arch St, Philadelphia, PA 19106, USA",
      "formatted_phone_number" : "(215) 409-6600",
      "geometry" : {
         "location" : {
            "lat" : 39.9538916,
            "lng" : -75.1490656
         },
         "viewport" : {
            "northeast" : {
               "lat" : 39.9546271302915,
               "lng" : -75.14777166970849
            },
            "southwest" : {
               "lat" : 39.9519291697085,
               "lng" : -75.15046963029151
            }
         }
      },
      "icon" : "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
      "id" : "c0fe170c2579a8d23f42bb3bc002ebe064d5096b",
      "international_phone_number" : "+1 215-409-6600",
      "name" : "National Constitution Center",
      "opening_hours" : {
         "open_now" : false,
         "periods" : [
            {
               "close" : {
                  "day" : 0,
                  "time" : "1700"
               },
               "open" : {
                  "day" : 0,
                  "time" : "1200"
               }
            },
            {
               "close" : {
                  "day" : 1,
                  "time" : "1700"
               },
               "open" : {
                  "day" : 1,
                  "time" : "0930"
               }
            },
            {
               "close" : {
                  "day" : 2,
                  "time" : "1700"
               },
               "open" : {
                  "day" : 2,
                  "time" : "0930"
               }
            },
            {
               "close" : {
                  "day" : 3,
                  "time" : "1700"
               },
               "open" : {
                  "day" : 3,
                  "time" : "0930"
               }
            },
            {
               "close" : {
                  "day" : 4,
                  "time" : "1700"
               },
               "open" : {
                  "day" : 4,
                  "time" : "0930"
               }
            },
            {
               "close" : {
                  "day" : 5,
                  "time" : "1700"
               },
               "open" : {
                  "day" : 5,
                  "time" : "0930"
               }
            },
            {
               "close" : {
                  "day" : 6,
                  "time" : "1700"
               },
               "open" : {
                  "day" : 6,
                  "time" : "0930"
               }
            }
         ],
         "weekday_text" : [
            "Monday: 9:30 AM – 5:00 PM",
            "Tuesday: 9:30 AM – 5:00 PM",
            "Wednesday: 9:30 AM – 5:00 PM",
            "Thursday: 9:30 AM – 5:00 PM",
            "Friday: 9:30 AM – 5:00 PM",
            "Saturday: 9:30 AM – 5:00 PM",
            "Sunday: 12:00 – 5:00 PM"
         ]
      },
      "photos" : [
         {
            "height" : 2952,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/112696836365828035827/photos\"\u003eeric jones\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAdfWHNsrqa-9Oh9crmZe7ZYEthAWs3XUauHB2XOiiecK6AfNZiRrVh8ov_HL_CwEDxq9n8CvYJDv6fRTJ_RxjHk1Ski-yb-OeakOWEFjS5fq3W0GuocY11rN1X0mY0z_qEhDySOIFxL874Wsa5HM0CvBuGhSNOZpHM7jq9vDx87hn-Z2NxTrZ9A",
            "width" : 5248
         },
         {
            "height" : 2992,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/108898310445749528737/photos\"\u003eChris Dantonio\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA7WNFvoL4W22rKSyf5puakQ1gitiwd_5vhohLd0TgHh3v4AqcHYrrmIFiRl9WQZ-oWKx-9iugHOIoFYM9P4dXTI8Kq8-TNH3z6YaIKXXvddTqQNomkgFEGZeEc4jgNzCdEhDuyBAgFyvRvw0HTK_AkuoMGhTzKtyYpedKHaLnKpcHvXFh9SHwIA",
            "width" : 3992
         },
         {
            "height" : 4032,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/101269600241267924308/photos\"\u003e박준석\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAprsjOGdkunDo2Q7Ea-W-xwDZ5_Vv5bGf3Hj3a1O9who97ubd8w6ppdBXAAIapJyARYKAxllrNCE9mPMUTt9QP4R58IUoYkDVxmON7Lo_c9tkoqut1OSWW-ojyE_f7Wh_EhASpVWEPTFRfKv8uFZePKNAGhS4-pUlyWMEo5RsDbKbMQS8GxiuzQ",
            "width" : 3024
         },
         {
            "height" : 1200,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/101592555604752857313/photos\"\u003eNir Marom\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAVZsxbCLMMKCsTBIRNRrFoWEo5JhPEzLPQuR1qsPZO0bjX9WEODARLWqzYy_1BOJdpB5Rr4Oo7IvLUNNCFJoILhcDxAlduS9vigrJ02OjHFo3tjlc4oSP6T_oNhkUuIWCEhDvBwQek-gKulGVrqaq7WmRGhQRJq2LGAMMEM0-BzeNzmeeO6uX4A",
            "width" : 1600
         },
         {
            "height" : 2160,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/117639425657163271133/photos\"\u003eAntonio Carlos Lessa\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAeeeGIHh275fBdjqFia6JjDDTlp2sjN6qltMGVWUk88cE9GPOcySyS6zoOOaWDCpnKv8fJc0V5uzA_eCpeJfGnVhZJhFj2ddGY2KtsOy2hmOXoQHXrRJoRUI-wtuMXx7bEhAGax62aFAYLETbrveIhB1AGhSoMonuOKLUY-oV5G_eKcyFkXxWMw",
            "width" : 3840
         },
         {
            "height" : 1836,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/103729015951669808993/photos\"\u003eNicolas Anitsakis\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAX5l5EMnOxcbALubjJf4QpeggcFfH3gqIVTAPCnA7wHoptW5dLHHO9uOtfd_iHF1_dA58S-gM26E_89X3DN-Di6C3HTS6XYyca8jQywBW3sARADT8BslkZNE1FpJlUJfoEhA_QHnndBq-dH_Ic38a3U8ZGhSZM5hjG0QPF16ULU1GMInzlEX-ZQ",
            "width" : 3264
         },
         {
            "height" : 3648,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/115194489872256613971/photos\"\u003eMike Waldvogel\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAJ7iob0budS70vcxp45f-30Z4TPXlG9lxsd1raUUGSUxnd-V4Keu1wycti18zp3JcFazf3oBRnSwRFV8Lr_F_7vFr_i7XUaFpPfTPCfDZULU3AWE6sfu1h_P2iaJabweeEhAV7JWm25SAZX1ZtbMw_rttGhQ5QSxRFyUHXVCSzbEqBmDlqE36Ew",
            "width" : 5472
         },
         {
            "height" : 1440,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/110165252926530097234/photos\"\u003ejames jones\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA1BvB2c80BSDd8J2mSPqmB04IJWTUpGGEw6FaxVwPiC7o-rV8ESNaQR_cZLDJ7aHRkUNvtOsQiHjpC_46y3yjjH9MmEU2Q8LUDfGFoeZLJKDwonNbD58qFj--OvvjfSDMEhDMoDWsMC0H5HKn-B-E6KqKGhQKbiGdTg3Xs-gBWiL2oNu1cpXDaA",
            "width" : 2560
         },
         {
            "height" : 2448,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/106260845757415186733/photos\"\u003eJill Kreitzer\u003c/a\u003e"
            ],
            "photo_reference" : "CmRZAAAAr7qOoecceRtjftYZWtmy-jKziycF-fdapN6Dv-igQc3ACdOs78IEKDCcoKsjxsgrZfoVISKZJ2yxKP76BGQl7YW7qg03rSHjwxe7LxHnVP2PVr7YXf_Zl3ECnY2EBm2cEhBP9-Lv9Rs7wglC90CORMtJGhRhP0Iogj3iZm6kEghzZEb3G88iyw",
            "width" : 3264
         },
         {
            "height" : 4032,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/113603826885130287858/photos\"\u003ejulieta garcia\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAk8Dbh32UXnRvH1XY0a69SNMoUuxVwLmyqGRu6uxnCe2oWeXTde9adS9ncxHFlY6r6gMI3qEJ3uA6CNoY0vabupD2NlNlZFgpOEhQqui4ua2p5smSt6dia4p0oe7a_klAEhDVGEby6vreLuJYdEuCBEQ_GhTg3J8npxYp-UE_PFI4jUDd0ND1Dw",
            "width" : 3024
         }
      ],
      "place_id" : "ChIJZ3LgS4HIxokRct8iqCzISOY",
      "rating" : 4.4,
      "reference" : "CmRSAAAAOHkkpD9Dw3qV4VjdDOnKpjJcXjDZSy0BBnQp1l2FubKuQxmb74OnufqCiZvv8RCPeawS52fhNQZ7aOMwznK97_4PGjVHaaDS6wWV8AH8oD0TlcZsOIfgXa9-cNjlrYQ_EhDC2SyEKbvrUznUM8n0SsCuGhS-254COQtIDtz84-MoMTDOvJfqGw",
      "reviews" : [
         {
            "author_name" : "Jason Hutton",
            "author_url" : "https://www.google.com/maps/contrib/107477474028856719315/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh3.googleusercontent.com/-ub_nBp_RNHg/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePb_HHg6pDU7Fa7rz0pWAEOU9Qw7qQ/s128-c0x00000000-cc-rp-mo-ba2/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "2 months ago",
            "text" : "I spent about 6 hours at the center and saw nearly everything.  I spoke with 2 highly educated museum staff members, Matthew and Bill, and they were of incredible assistance.  They knew their history.  The one man live show was the first I have ever seen of its kind.  My favorite part was signers hall.  To look at these men as they would appear in 1776, their physical characteristics and their demeanor, is great.  It really helps give you a sense of who they are.  There are several interactive displays.  The museum layout is practical.  Staff is great.  Special exhibit of Chief Justice John Marshall was excellent as well.  Matthew and Bill both helped me learn a lot about Marshall and the several other questions I had.  Overall it was a great experience.",
            "time" : 1503161777
         },
         {
            "author_name" : "Mike Peckenschneider Sr",
            "author_url" : "https://www.google.com/maps/contrib/101054840394925523454/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-3mvUPjiVwJE/AAAAAAAAAAI/AAAAAAAABtU/BBvynUq2mfg/s128-c0x00000000-cc-rp-mo/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "a month ago",
            "text" : "I work in Center City and park here when I don't take the train   It is safe, secure, well lit, clean garage with entrance on Race street which is rear of facility.  contrary to other posts I find this to be a LEFT leaning place based upon the election and the topics, events hosted, invited speakers, and it is in one of the farthest LEFT cities in the country.  politics aside this is convenient and interesting place that is easier and more affordable than most all others in Center City.  ENJOY, and be sure to tour the US Mint for FREE across the street. weekdays only 9-4 with Saturdays available between Memorial and Labor Day",
            "time" : 1503766724
         },
         {
            "author_name" : "Sean Quach",
            "author_url" : "https://www.google.com/maps/contrib/108364314318630465305/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/-NHiPGJojeSM/AAAAAAAAAAI/AAAAAAAAEpE/mycHLtlrLe8/s128-c0x00000000-cc-rp-mo-ba3/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "3 months ago",
            "text" : "Must see for exploring America's history and includes a We the People narrated performance. Circular exhibit layout is modern and well organized. I appreciated a voting booth area simulating presidential elections from different era presidents to choose which position you would vote for, with guest votes aggregated. ",
            "time" : 1500082226
         },
         {
            "author_name" : "Cynthia Okimoto",
            "author_url" : "https://www.google.com/maps/contrib/104882209762260645348/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh3.googleusercontent.com/-Xmmzv0zJECA/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePYzjlSkcETdiXf9x2ELvV_E465cyA/s128-c0x00000000-cc-rp-mo/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "2 months ago",
            "text" : "Top notch place. Extremely clean, and has great exhibits. If you want to bring your kids you will not regret.  Staff is very friendly, helpful and knowledgeable. Located with other great attractions. I highly recommend this place.\n\nAbsolutely wonderful museum. My husband, kids, and I had a great day exploring the historical sites in Philadelphia and this was the best stop of the day. The staff was super friendly and informative. If you get a chance check it out.",
            "time" : 1502564664
         },
         {
            "author_name" : "Russ Hickman",
            "author_url" : "https://www.google.com/maps/contrib/100369787259429412899/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh3.googleusercontent.com/-k-rRMM79sbQ/AAAAAAAAAAI/AAAAAAAAAHc/uJ_v305CLBE/s128-c0x00000000-cc-rp-mo/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "2 weeks ago",
            "text" : "Just photographed a wedding here this past Saturday and I feel in love with this space as a wedding venue! Hip historic and classy!",
            "time" : 1507214934
         }
      ],
      "scope" : "GOOGLE",
      "types" : [ "museum", "point_of_interest", "establishment" ],
      "url" : "https://maps.google.com/?cid=16593732921171566450",
      "utc_offset" : -240,
      "vicinity" : "525 Arch Street, Philadelphia",
      "website" : "http://constitutioncenter.org/"
   },
   "status" : "OK"
},
        {title: "Comcast Center", 
        reviews: [], 
        rating: [4,4,4,5], 
        avgRating: 4.25,
        location: {lat : 39.9547,lng : -75.1686}, 
        id: "66ee5ee74877c366b0ec0147ae4d725dd5403d87", 
        details: {
      "address_components" : [
         {
            "long_name" : "Comcast Center",
            "short_name" : "Comcast Center",
            "types" : [ "premise" ]
         },
         {
            "long_name" : "Center City",
            "short_name" : "Center City",
            "types" : [ "neighborhood", "political" ]
         },
         {
            "long_name" : "Philadelphia",
            "short_name" : "Philadelphia",
            "types" : [ "locality", "political" ]
         },
         {
            "long_name" : "Philadelphia County",
            "short_name" : "Philadelphia County",
            "types" : [ "administrative_area_level_2", "political" ]
         },
         {
            "long_name" : "Pennsylvania",
            "short_name" : "PA",
            "types" : [ "administrative_area_level_1", "political" ]
         },
         {
            "long_name" : "United States",
            "short_name" : "US",
            "types" : [ "country", "political" ]
         },
         {
            "long_name" : "19103",
            "short_name" : "19103",
            "types" : [ "postal_code" ]
         }
      ],
      "adr_address" : "\u003cspan class=\"extended-address\"\u003eComcast Center\u003c/span\u003e, \u003cspan class=\"locality\"\u003ePhiladelphia\u003c/span\u003e, \u003cspan class=\"region\"\u003ePA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e19103\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUSA\u003c/span\u003e",
      "formatted_address" : "Comcast Center, Philadelphia, PA 19103, USA",
      "geometry" : {
         "location" : {
            "lat" : 39.95470299999999,
            "lng" : -75.16849619999999
         },
         "viewport" : {
            "northeast" : {
               "lat" : 39.9557242802915,
               "lng" : -75.1672082697085
            },
            "southwest" : {
               "lat" : 39.9530263197085,
               "lng" : -75.1699062302915
            }
         }
      },
      "icon" : "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
      "id" : "66ee5ee74877c366b0ec0147ae4d725dd5403d87",
      "name" : "Comcast Center",
      "photos" : [
         {
            "height" : 2448,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/105589394049121762776/photos\"\u003eBrent Gueth\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAtW3o8txz5vFJH-b5oWFnNbINwq2Bi_Ee1bqzs8D2zfLdh6GYYP1PCskP3vIVvV6nJAGdO5DCF6HnTTCim15kvla-VX0hwS1ky1AlNd9v2qQbaaQ9afawkTDgDMnt1qyBEhDxHDdoXGeOlwkyD-IkG-pnGhRQSxuOEeZnjHOGxmZMqrgtZcyzog",
            "width" : 3264
         },
         {
            "height" : 2340,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/114562599523660996130/photos\"\u003eJason Treadway\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA9W4okuKan_FuhvUUDraUZXrQ7aOwtai7GIa4a3cLc5cFX-UwH8P7BJmHf3RTMzqblYkJcv8LjFAJu64admwHeYlsgtgjhFjipieewjwif3QEPRaxRkP6VVDqRlKNtTPPEhBdPVRVoHbk_1q5Lurz5_kDGhTGY55e7bGu75BlUQ3jLCrXTuG_0Q",
            "width" : 4160
         },
         {
            "height" : 3780,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/117678753005914480830/photos\"\u003eRaja Rajan\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAACUOwM2munE08lAOYpkGgJuvaVEEcxoRWjbMPSOiqxMXy3tno294NAFC4A_Y78jrwGZrmNako2N0T3ey6zgyH-reA4xad_q-QbDeUXf1RgjUGm3nYMkyTkv9MjGKHQnw3EhAngqW6Qg0tlPxB3deAlXJdGhR5Vzb-_Cg_kc7yn-aq5s3QZgLpcw",
            "width" : 3024
         },
         {
            "height" : 2232,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/113431947881644344263/photos\"\u003eSteve Lex\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAiJT0tllkpeRpjzoqMO9ESyBGOTVP3kpyIp8sIclew1iAr3iFzNtjp_8t3v7lglhOqwoxgLML4b8SaMxzdMtgZjx0dqyAzqUPswqmBo4Rf5VBLL5snxrsFSCr8n03sFi5EhBlrSVpppAsi6Jlqt44Q7SyGhQjtCSNJVcALOPBUa3ccsO6yOmIBw",
            "width" : 3968
         },
         {
            "height" : 3264,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/105589394049121762776/photos\"\u003eBrent Gueth\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAIbiUyKBh0pfRNfqFQx5uR-o06wNezx07D6NLjapGmqa5VHZlYc341KdAToGqw4M9tkH0rnlHVPAhCUfH_3uelY-EiqVjIwozsscZ-w9P_AqIt7kGZqe-7bCYLSyT4iG3EhD2CJOmaU9P2oTny0rTHYtFGhRbtUIRC2xmDdpu7L7f9MSK3PUIMA",
            "width" : 2448
         },
         {
            "height" : 1735,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/116187307364771941627/photos\"\u003eAndrew McNown\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA8usELfSFSWfH-Z2DEgBz5mQMyEKUTY2hUjVkYl-h8UedBxt65XZc6Neaib8eriuSXRYCvNGbkF0Y_MgxggBRLeV4_ptUKW5qwADjkcsfC6gTZftCZf92b43kB6VEGYv_EhAYb_QBbWqbtXM9AESlAp7oGhQKEfQNiAcb3xkOanrLlO5K8P-kfA",
            "width" : 1740
         },
         {
            "height" : 2988,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/108577347863913939908/photos\"\u003eMaria Irene Roman\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAArJd3Ez6f1VLcrw0BX-ZlxF7S5LP3JtWhXNEFxNN-C6Ah4G-x8km7lia3NdOOXWGieWdA_jlrISRCh9Zs7_S5p-XUh4Y9k1jb12opI-io-TrE3qgiOh10vVhqwbEEyMY0EhB9dIIvZDPXt2AKT0bzQKXCGhSD7up0xqyTOta6io2sPg9CH3u3aQ",
            "width" : 5312
         },
         {
            "height" : 3006,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/113431947881644344263/photos\"\u003eSteve Lex\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA4fzRIvdkxZ1KmA6aY4ir0ecXEoA5bNFtkEWHHofeHRaj-HPvjbE5PAIXIj1lZTrjF0Fww5i-TbUvgvoIWdTnc1mbSNnmuexwB_V4sTTNslyMF03ryEK0ocurezvByfybEhBUWWvvMPGTmZnEJPoYvNWtGhQ6mUautw6ROpzPuVspCbxbj3PukA",
            "width" : 5344
         },
         {
            "height" : 3040,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/110232561357776141618/photos\"\u003eSteve Gregos\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAmhzGcuDXei1k1bxaWBAPtsj3ZaIdtvKmoYExS6bW6Ur8SRj_HGvYTFgUgOqF2G4cTu1nXXgVOzT5f1uozz8hMJkNFo6QDMEj_pR1BIX6HuQshNwBKceJ3xlbkLcKHWPwEhCPZp0rQeigI4AHES3xQxUrGhQXcwtVkqwVyB0aa6TZccwuNpSxzw",
            "width" : 4096
         },
         {
            "height" : 5344,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/113431947881644344263/photos\"\u003eSteve Lex\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAynFDNG7re1tBzPo67IPhz5J1qw4CYxrXwDmo19fDmUHSIQTQncjUqkDwAF4cDrod5k3scO6hRSbSUcAng2N-ACQnq2E0INO26GB4kygp1XwnELgQ-xERxVju2R7-xiYREhBYr7jBUOKDJ2GamViCldfBGhQxLi7__Nc85O61a0ZIrTi5M8LaIg",
            "width" : 3006
         }
      ],
      "place_id" : "ChIJfREvhDHGxokRZTo_so1ub2w",
      "reference" : "CmRbAAAAS6Q6bj129w3aDrj8mJaCM9UieS7pcmAJRYsoqWSReP7RsU01FmpmxyomHD-1e_c7rO7hg9kmioCx6w7j840hWVrw5C7MVwXftg_svDHuzuQizRtuxtGANmt44XBxWa1xEhDwYSwUoVVF5KMxPtq5UdV_GhQcF1eBLbitP4qEpiNvcg6TdtN0yA",
      "scope" : "GOOGLE",
      "types" : [ "premise" ],
      "url" : "https://maps.google.com/?q=Comcast+Center&ftid=0x89c6c631842f117d:0x6c6f6e8db23f3a65",
      "utc_offset" : -240,
      "vicinity" : "Philadelphia"
   },
   "status" : "OK"
},
        {title: "ACME Markets", 
        reviews: [], 
        rating: [2,3,2,3], 
        avgRating: 2.5,
        location: { lat: 39.932301, lng : -75.16229729999998}, 
        id: "ab22481ebd79af79ec4e19061a36017565e8e0fb", 
        details: {
      "address_components" : [
         {
            "long_name" : "1400",
            "short_name" : "1400",
            "types" : [ "street_number" ]
         },
         {
            "long_name" : "East Passyunk Avenue",
            "short_name" : "E Passyunk Ave",
            "types" : [ "route" ]
         },
         {
            "long_name" : "Passyunk Square",
            "short_name" : "Passyunk Square",
            "types" : [ "neighborhood", "political" ]
         },
         {
            "long_name" : "Philadelphia",
            "short_name" : "Philadelphia",
            "types" : [ "locality", "political" ]
         },
         {
            "long_name" : "Philadelphia County",
            "short_name" : "Philadelphia County",
            "types" : [ "administrative_area_level_2", "political" ]
         },
         {
            "long_name" : "Pennsylvania",
            "short_name" : "PA",
            "types" : [ "administrative_area_level_1", "political" ]
         },
         {
            "long_name" : "United States",
            "short_name" : "US",
            "types" : [ "country", "political" ]
         },
         {
            "long_name" : "19147",
            "short_name" : "19147",
            "types" : [ "postal_code" ]
         },
         {
            "long_name" : "5611",
            "short_name" : "5611",
            "types" : [ "postal_code_suffix" ]
         }
      ],
      "adr_address" : "\u003cspan class=\"street-address\"\u003e1400 E Passyunk Ave\u003c/span\u003e, \u003cspan class=\"locality\"\u003ePhiladelphia\u003c/span\u003e, \u003cspan class=\"region\"\u003ePA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e19147-5611\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUSA\u003c/span\u003e",
      "formatted_address" : "1400 E Passyunk Ave, Philadelphia, PA 19147, USA",
      "formatted_phone_number" : "(215) 467-2221",
      "geometry" : {
         "location" : {
            "lat" : 39.932301,
            "lng" : -75.16229730000001
         },
         "viewport" : {
            "northeast" : {
               "lat" : 39.9332740802915,
               "lng" : -75.1605020697085
            },
            "southwest" : {
               "lat" : 39.9305761197085,
               "lng" : -75.16320003029152
            }
         }
      },
      "icon" : "https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
      "id" : "ab22481ebd79af79ec4e19061a36017565e8e0fb",
      "international_phone_number" : "+1 215-467-2221",
      "name" : "ACME Markets",
      "opening_hours" : {
         "open_now" : true,
         "periods" : [
            {
               "close" : {
                  "day" : 0,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 0,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 1,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 1,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 2,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 2,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 3,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 3,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 4,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 4,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 5,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 5,
                  "time" : "0700"
               }
            },
            {
               "close" : {
                  "day" : 6,
                  "time" : "2200"
               },
               "open" : {
                  "day" : 6,
                  "time" : "0700"
               }
            }
         ],
         "weekday_text" : [
            "Monday: 7:00 AM – 10:00 PM",
            "Tuesday: 7:00 AM – 10:00 PM",
            "Wednesday: 7:00 AM – 10:00 PM",
            "Thursday: 7:00 AM – 10:00 PM",
            "Friday: 7:00 AM – 10:00 PM",
            "Saturday: 7:00 AM – 10:00 PM",
            "Sunday: 7:00 AM – 10:00 PM"
         ]
      },
      "photos" : [
         {
            "height" : 500,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/117052661046618170885/photos\"\u003eACME Markets\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAIiueM-H-dikf_-zqSV0VOqBzR_BGEIFHdvDVMh5YDIN4_XSQEFM-FI7M87NRrOVAQRu234OwF2Ro7QWCAHWrWcfeM2wEn0TW__hQgvWS0847LW-NsGe7Ewc5QAvohc6EEhBdwqUti8QR03_Zk2P4cln_GhTmsZr4_9z8sItoDKr-ZLs6LUZyNA",
            "width" : 500
         },
         {
            "height" : 4032,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/116742758791711538886/photos\"\u003eJustin K\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAARL1ZbWvISEUaWZp26GJIaH0CMi4bpUvNYKjc1a4CpSdGCyOQ2QCZ1RqqroYib9HRbBvCfbKSaAseuVz3CE2pPoq472L7cGUGs9ke5GYH_OzFYj8uvhYEX3xTp23wshXkEhA_6juOKvfxrsgir1m-qQenGhTwZgClPLrXNC8X8dDZTkGdGk9QWA",
            "width" : 3024
         },
         {
            "height" : 4160,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/103777408635169343031/photos\"\u003eJoseph Trout\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAuCcxcB_gVrAzD21mmWANtp1K-abdPv3_u00JqrXmO9olJ0fHuQcSVJcdlxCQmrimdg6ocVQbxCMvl0sMKnLSR4ex3dZ3ZWZYTarFvQ7ku0bfYcGp26Ds8woriN5fPnfWEhD3AIQZP-04NKsAmXQCHValGhRg55qltKsUMnLg61hIHkSfN9MAwA",
            "width" : 3120
         },
         {
            "height" : 2268,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/115899621294062781669/photos\"\u003eDennis Dawton\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAPKUxFxYSfYGeyh9sTKJ-nelR371TgRLkVzXdqf3GJUi8h0t706qxvXR4QC8GwJsPu4xNTQAssqNXLjOGvNdt3HhvkAbA5eUiUO_m64tpdVrKwc6Z01iTk2sqUlS2otgiEhAsUFsbMBf1YsVSa_BEGSJuGhRS1Q8snTavANFdBRn4eNIgMPtKMQ",
            "width" : 4032
         },
         {
            "height" : 5344,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/111135841671231359232/photos\"\u003eStephen Taylor\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAThmkgxkhBy2nEKXbOaYFNeA28nWY73VOUVF0oMxrOMfNM1anUe9JM06bObQUq2iwrSV1WbjBLyPcobJH2OqOFPzVErHJEEVWfF0IV7mv3KoPw_0JToDLoKuivoNDJFV_EhC9cwsq2yCpEkDItia_nILeGhQKdyHAcUf9m0aIDiTsIpidP1nptA",
            "width" : 4008
         },
         {
            "height" : 3006,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/112381457997061576026/photos\"\u003eAnthony Michetti\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAA-7Nu92NlsAMgTggZNpa27MQC_YvU5ovNzb6frt-8Rx0RRs08TUwxfaBq7SvikVlWPVTfvIvmhDOxNjjK57n6h1K14yssljcRHQOHrEeFyH_JeD1xzkCDAobMYAy1bVF3EhAtRLygHLbBIfxTxiWBp0QbGhRHh1_h6M-4BbAW3gmePqymIB4fSQ",
            "width" : 5344
         },
         {
            "height" : 5344,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/111135841671231359232/photos\"\u003eStephen Taylor\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAmCU4VNWKu09Qc-QVXIASPTbOCfsxcmwyWDy9HKRb8oTOC1oALEi7jvB1k-kcxIYPdTDcYb8YrwhUilMw6vy90hRvcaYS6eeF_ZHPPKDsSOZLBWOaaLSPez5YI3Fr3Nm5EhAT3HuOZIw-lWWo-cXeHg6TGhSlB2Wzd_IfmRSE_eZJCtcsBxWbiQ",
            "width" : 4008
         },
         {
            "height" : 2322,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/117687174921776247586/photos\"\u003eAbbi Warren\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAYFuiGcZBvs5nZiTJ2pGAyZbLdKJyUNxFXgM0F3DTsyueSjy1TfkKvhqn4Wgo1eg1p8bwQhUcjFAb4OGH67jKsGdCTOwAYdDZuHMHqq5_sB8xTBwUT65ffYKUk9l8oKlIEhCzEP0QAb28dQCCxk-xaVxPGhS7oJeYIXTdTZlnzSB9fLRVnwYTEg",
            "width" : 4128
         },
         {
            "height" : 5344,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/112381457997061576026/photos\"\u003eAnthony Michetti\u003c/a\u003e"
            ],
            "photo_reference" : "CmRaAAAAtUgZJrod76mIA5kQGUf9nFGqJ-8-ltnoIAEmR0EfS4UNXEtT7mEOhpLbBYr21r8Dgz_KR5B_w_DAKnb5jSpZzt-Yp0hq36cxbeGOPHEetxeMyz7Xd4YMWUq0y7NnwtKiEhAacDN6HFwxmGYk1LRLTbNXGhSVHZBrU2u9krbHJL1L4zjK-tMcyw",
            "width" : 3006
         },
         {
            "height" : 3480,
            "html_attributions" : [
               "\u003ca href=\"https://maps.google.com/maps/contrib/109369184736396992099/photos\"\u003eOr Ben-Ari\u003c/a\u003e"
            ],
            "photo_reference" : "CmRZAAAAKfpH5KPv9PvFAu6hnt-W7iuvAqbmtcDHVDMtanEq7arB_1EZWfIZ0dvyKhPa3Y_kt-WuMn7X5pCzz6us6beMinfJ4pk6J8LppPoSE8dCuQTFS4eNquIStRXaFPvwrntxEhD_d1ArUq0YgslerOlGe1isGhR2ZkhSkyAwRSr0-ECUxTUhQm4UoQ",
            "width" : 4640
         }
      ],
      "place_id" : "ChIJG3ZZhRvGxokRmxBVmNbhhfQ",
      "price_level" : 2,
      "rating" : 3.8,
      "reference" : "CmRSAAAAFoPB6o8J1xJlbO3hfc-uLBHKcXgr9rHYXRKm7HQ-ocZDQIhdISYqdJkkhgm90bEsuAWroK2Wi_EjIFPIPLff28QTs7u-nT6TF3UzS11CbgY5phnc4c5cCbR9HtTSNW9-EhAQO8ch3SEtc4UXDC6Ieh05GhSsomTowGwtOZr9t0EMqSyRLFkrfw",
      "reviews" : [
         {
            "author_name" : "Neeraj Jassal",
            "author_url" : "https://www.google.com/maps/contrib/101492142166151928032/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/-kLx2EKeffIU/AAAAAAAAAAI/AAAAAAAAAcI/UlVj9orNehc/s128-c0x00000000-cc-rp-mo-ba3/photo.jpg",
            "rating" : 3,
            "relative_time_description" : "in the last week",
            "text" : "I live in the neighborhood and it's great to have a full service grocery store so close to home. But it's expensive - and I think their meats and veggies should be fresher for what you pay for. They have made a lot of improvements recently, though, so I hope it continues to get better. Staff has always been very friendly and helpful.",
            "time" : 1508284520
         },
         {
            "author_name" : "Ryan Glynn",
            "author_url" : "https://www.google.com/maps/contrib/105373937588700453509/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-hzzTx9SDmqI/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePZOep1RUaSk_EX-mg33IlwBrii8KQ/s128-c0x00000000-cc-rp-mo-ba2/photo.jpg",
            "rating" : 4,
            "relative_time_description" : "a week ago",
            "text" : "Very organized, friendly staff and clean. If they don't have something specific you want you can ask customer service if they can get it in. Great produce department that has a good selection it organic items. They have a good selection if gluten free and vegan items. They also have a Redbox and Coin Star.",
            "time" : 1507467983
         },
         {
            "author_name" : "Caleb Radens",
            "author_url" : "https://www.google.com/maps/contrib/116233799351028541162/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-mZn1lYQCcP0/AAAAAAAAAAI/AAAAAAAAEGA/q9gFQSP47tI/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "a month ago",
            "text" : "Fantastic grocery store. I'm used to Wegmans and other large grocery stores... Most groceries in Philly are on the smaller side and too expensive. This place is great: wide selection and fair prices.",
            "time" : 1504963755
         },
         {
            "author_name" : "Eileen Tran",
            "author_url" : "https://www.google.com/maps/contrib/113247875124616916994/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh5.googleusercontent.com/-dt38P8eiTYs/AAAAAAAAAAI/AAAAAAAAAAA/ACnBePbTq9-eqyrbJ-9E8etD_idaYIw6qA/s128-c0x00000000-cc-rp-mo/photo.jpg",
            "rating" : 5,
            "relative_time_description" : "2 months ago",
            "text" : "Great supermarket! Closest grocery store near my house. I find virtually everything i'm looking for. Today the man working the fresh fish section David was super knowledgeable and went above and beyond to help me pick out the best salmon for me :) They are opening a alcoholic aisle soon Fall 2017 so that's a plus!",
            "time" : 1502588473
         },
         {
            "author_name" : "Jenn Morton",
            "author_url" : "https://www.google.com/maps/contrib/113615873443816234215/reviews",
            "language" : "en",
            "profile_photo_url" : "https://lh4.googleusercontent.com/-L3QDLtdvutE/AAAAAAAAAAI/AAAAAAAAErc/aY3WDDTqS9w/s128-c0x00000000-cc-rp-mo-ba3/photo.jpg",
            "rating" : 4,
            "relative_time_description" : "in the last week",
            "text" : "A fine grocery store with great sales from time to time; a bit pricey otherwise though.",
            "time" : 1508322163
         }
      ],
      "scope" : "GOOGLE",
      "types" : [
         "grocery_or_supermarket",
         "food",
         "store",
         "point_of_interest",
         "establishment"
      ],
      "url" : "https://maps.google.com/?cid=17619737428951896219",
      "utc_offset" : -240,
      "vicinity" : "1400 East Passyunk Avenue, Philadelphia",
      "website" : "https://local.acmemarkets.com/pa/philadelphia/1400-e-passyunk-ave.html"
   },
   "status" : "OK"
},
        ]};