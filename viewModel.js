// Model defiend below viewModel due to length or entries
/*global arrayContainer:true, SliderInstance:true, DomObjects:true *//*global arrayContainer:true, DomObjects:true */
//INITIALIZE MAP

// Create global user instance variables
var userLocation;
var findResult;
var addMarker;
var origin;
var drawingManager;
var directionsDisplay;
var directionsService;
var placeInfo;
var places;
var map;
var addRating;
var addResult;
var addDetails;
var currentProfile;
var matrixResponse;
var closestLoc;
var circle;
var activeWindow;
var hours;
var moreImage;
var stockImage = "images/noimage.jpg";


var viewModel = {
	//creates marker insatnce from restRooms array
  createMarker : function (location) {
    placeInfo = new google.maps.InfoWindow();
    pos = location.location;
    var name = location.title;
    id = location.id;
    map = map;
    icon = "images/TP.png";

    var mark = new google.maps.Marker({
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
      map.panTo(this.getPosition());
    });
  },

  initializeMarkers: function () {
    //iterate over restrooms list to create markers
    for ( i = 0 ; i < model.restRooms.length; i += 1 ) {
      this.createMarker(model.restRooms[i]);
    }
  },

  showAllMarkers: function(){
  	//set all markers visibilility to 'true' when "show all" button clicked
    this.hideAllPopUps();
    for (i = 0; i < model.markers.length; i += 1) {
      model.markers[i].setVisible(true);
    }
  },

  hideAllMarkers: function(){
  	//set all markers visibility to 'false'
    this.showLocationProfile(false);
    if (activeWindow) {
      activeWindow.close();
    }
    directionsDisplay.setMap(null);
    for (i = 0; i < model.markers.length; i += 1) {
      model.markers[i].setVisible(false);
    }
  },

  showFindBox: ko.observable(false),
  showSubmitForm: ko.observable(false),
  showAddBox: ko.observable(false),
  showAddForm: ko.observable(false),
  showLocationsList: ko.observable(false),
  showSuccessMessage: ko.observable(false),
  showErrorMessage : ko.observable(false),
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
  profId : ko.observable(),
  showMessage : ko.observable(),
  errorMessage : ko.observable(),
  restroomsArray : ko.observableArray(),
  profileRating : ko.observable(),
  reviewsArray : ko.observableArray(),
  flickrPhotosArray : ko.observableArray(),
  restroomsFilterArray : ko.observableArray(),
  filterButtonRating : ko.observable(5),
  revReview : ko.observable(),
  addReview : ko.observable(),


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
    viewModel.showFindBox(false);
    viewModel.showAddBox(false);
    viewModel.showAddForm(false);
    viewModel.showSubmitForm(false);
    viewModel.showLocationsList(false);
    viewModel.showSuccessMessage(false);
    viewModel.showErrorMessage(false);
    viewModel.showReviewForm(false);
    viewModel.showDirections(false);
    viewModel.showFiltersBar(false);
    viewModel.showRatingsFilter(false);
    directionsDisplay.setMap(null);
  },

  findNearest: function(){
    //declare callback function for directions use
    function callback(response, status) {
      var closestId = null;
      var closestPos = null;
      if (status == "OK") {
        markerDist = response.destinationAddresses;
        matrixResponse = markerDist;
        var currentDist = null;
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
    var current = this.findMarker(currentProfile.id).getPosition();
    if (userLocation) {
      this.displayDirections(userLocation, current);
    } else {
      this.showHiddenMessage("Nope", "Please enter your location into the search bar, or click the map to drop a pin.");
      }
  },

  showByRating : function(rating) {
    this.filterButtonRating(rating);
    //remove open circles/directions
    directionsDisplay.setMap(null);
    if (circle) {
      circle.setMap(null);
    }
    list = [];
    for (i = 0; i < model.restRooms.length; i += 1) {
      //comapre average rating of locatino to rating choice
      if (model.restRooms[i].avgRating >= rating) {
        //set marker visibilty of location to true if location ranks at or higher than rating
        ratedMark = viewModel.findMarker(model.restRooms[i].id);
        ratedMark.setVisible(true);
        list.push(model.restRooms[i]);
      } else {
        //set visibility to false if rating is below chasen rating
        viewModel.findMarker(model.restRooms[i].id).setVisible(false);
        }
    }
    if (list.length === 0) {
      list.push({title: "No locations match that rating"});
    }
    this.restroomsFilterArray(list);
  },

  listLocations : function() {
    this.restroomsArray(model.restRooms);
    directionsDisplay.setMap(null);
    this.hideAllPopUps();
    this.showLocationsList(true);
  },

  addWindowInfo : function (marker, placeInfo){
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
    this.showReviewForm(true);
  },

  submitAddInfo: function() {
    if (addRating) {
      var match = this.findRestroom(addResult.id);
      if (match === null) {
        var reviewDraft = viewModel.addReview();
        var rating = addRating;
        var newRestroom = {
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
    this.addReview("");
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
      reviewDraft = viewModel.revReview();
      prof.reviews.push(reviewDraft);
      prof.rating.push(addRating);
      prof.rating.push(rating);
      this.showSubmitForm(false);
      this.showAddForm(false);
      this.showHiddenMessage("OK", "Your review has been added to" + prof.title);
    }
    this.revReview("");
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

  getProfile : function (location) {
    viewModel.displayLocationProfile(location.id);
  },

  hideList : function() {
    this.showLocationsList(false);
  },

  hideRatingsList : function() {
    this.showRatingsFilter(false);
  },

  hideProfile : function() {
    this.showLocationProfile(false);
  },

  showHiddenMessage: function(response, message) {
    if (response === 'OK') {
      this.showMessage(message);
      this.showSuccessMessage(true);
      setTimeout(viewModel.hideAllPopUps, 2000);
    } else {
      this.errorMessage(message);
      this.showErrorMessage(true);
      setTimeout(viewModel.hideHiddenMessage, 3000);
      }
  },

  hideHiddenMessage: function() {
    viewModel.showSuccessMessage(false);
    viewModel.showErrorMessage(false);
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
    mark = this.findRestroom(id);
    this.showDirections(false);
    this.showLocationProfile(true);
    this.getFlickrImage(mark.title);
    currentProfile = mark;
    this.profileName(mark.title);
    this.searchWikiInfo(mark.title);
    this.profId(mark.id);
    rating = this.calculateRatingAvg(currentProfile);
    this.profileRating("Users think it's : " + rating);
    if (mark.reviews.length < 1) {
      viewModel.reviewsArray(["No reviews for this location yet."]);
    } else {
        viewModel.reviewsArray(mark.reviews);
    }
    for (i = 0; i < model.markers.length ; i++) {
      model.markers[i].setAnimation(null);
    }
    marker = this.findMarker(id);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    map.panTo(marker.getPosition());
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
    setDrawingMap(drawingManager);

    function setDrawingMap() {
      if (drawingManager.map) {
        drawingManager.setMap(null);
      } else {
        drawingManager.setMap(map);
      }
    }

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
          if (result[2][0]) {
            viewModel.profileWiki(result[2][0]);
            viewModel.wikiLink(result[3][0]);
          } else {
            viewModel.profileWiki("No summary information is availble for this location.");
            viewModel.wikiLink(result[3][0]);
          }
        },
        error: function() {
          viewModel.profileWiki("Unable to reach WikiPedia servers at this time.");
        }
      });
    });
  },

  getFlickrImage: function (title) {
    search = title.split(" ");
    search.push("Philadelphia,Pennsylvania");
    search = search.toString();
    url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=b8660599f802c619f1bf187ac20fabb3&&tag_mode=any&sort=relevance&per_page=5&format=json&nojsoncallback=1&tags=";
    url += search;
    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      success: function(response) {
        if (response.stat === 'ok') {
          imgsrcs = [];
          for (i = 0 ; i < response.photos.photo.length; i ++) {
            pic = response.photos.photo[i];
            src = "https://farm"+pic.farm+".staticflickr.com/"+pic.server+"/"+pic.id+"_"+pic.secret+".jpg";
            imgsrcs.push(src);
          }
          viewModel.flickrPhotosArray(imgsrcs);
        } else {
          viewModel.flickrPhotosArray([stockImage]);
        }
      },
      error: function(response) {
        viewModel.flickrPhotosArray(["Flickr servers were unable to complete this request, due to an '" +
        response.message + "' error. 'code': " + response.code + ", 'stat': " + response.stat]);
      }
    });
  },

  getGoogleImage: function(ref) {
    url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&key=AIzaSyCX8Zi0hHtFLV-g-yLo9QBOfFo3j_dNWsE&v=3&photoreference=";
    url += ref;
    return url;
  },

  displayMoreInfo : function() {
    viewModel.showMoreInfo(true);
    place = this.findRestroom(viewModel.profId());
    this.profileName(place.title);
    this.profileAddress(place.details.formatted_address);
    moreImage = this.getGoogleImage(place.details.photos[0].photo_reference);
    this.detailsImage(moreImage);
    if (place.details.hasOwnProperty("photos")) {
      detailsImages = stockImage;
    }
    if (place.details.hasOwnProperty("opening_hours")) {
      hours = place.details.opening_hours.weekday_text;
      this.hoursArray(hours);
    } else {
      this.hoursArray(["No hours information available for this location"]);
    }
  },

  hideMoreInfo : function () {
    this.showMoreInfo(false);
    hours = null;
  }
};

//initialize map
function initMap() {
  //create styling for map
  styles = [
    {
      elementType: 'geometry',
      stylers: [{color: '#5d6e87'}]},
    {
      elementType: 'labels.text.stroke',
      stylers: [{color: '#242f3e'}],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{color: '#fdffb7'}]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{color: '#233044'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{color: '#dbf4d0'}]
    },
    {
      featureType: 'poi.business',
      stylers: [{visibility: 'off'}]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{color: '#f7c5da'}]
    }]

  //set map in philadelphia
  map = new google.maps.Map(document.getElementById('map'), {center: {lat: 39.963043409283806, lng:-75.16313552856445},
    zoom: 13,
    disableDefaultUI: true,
    styles: styles
  });

  places = new google.maps.places.PlacesService(map);
  placeInfo = new google.maps.InfoWindow();
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.CIRCLE,
    drawingControl: true,
    drawingControlOptions: {
    position: google.maps.ControlPosition.TOP_CENTER,
    drawingModes: [
    google.maps.drawing.OverlayType.CIRCLE]}
  });

  drawingManager.addListener('overlaycomplete', function(event) {
    viewModel.showEraseCircle(true);
    viewModel.hideAllMarkers();
    if (circle) {
      circle.setMap(null);
      hideListings(markers);
    }
    // Stop drawing mode
    drawingManager.setDrawingMode(null);
    circle = event.overlay;
    circle.setEditable(true);
    // Search within
    viewModel.searchArea();
    // re-check if boudries/center change
    google.maps.event.addListener(circle, 'radius_changed', function(){
      viewModel.searchArea();
    });
    google.maps.event.addListener(circle, 'center_changed', function(){
      viewModel.searchArea();
    });
  });

  //add listener to map to create pin drop at user location
  google.maps.event.addListener(map,'click', function(event) {
    dropPin(event.latLng);

    //drop pin in user location
    function dropPin(location) {
      if (circle) {
        circle.setMap(null);
      }
      viewModel.hideAllPopUps();
      viewModel.showFiltersBar(true);
      if (placeInfo) {
        placeInfo.close();
      }
      icon = 'images/youAreHere.png';
      if (addMarker) {
        addMarker.setVisible(false);
      }
      if (userLocation) {
        userLocation.setPosition(location);
        userLocation.setVisible(true);
      } else if (findResult) {
        findResult = location;
      } else {
        userLocation = new google.maps.Marker(
          {title: "Your location",
          position: location,
          map: map,
          draggable: false,
          visible: true,
          icon: icon
        });
      }
      map.setCenter(userLocation.position);
    }//end dropPin
  });//end click-map event listener

  //add autocomplete to finderbox

  var finderInput = document.getElementById('locationBox');

  var finderAutocomplete = new google.maps.places.Autocomplete(finderInput);

  finderAutocomplete.bindTo('bounds', map);

  finderAutocomplete.addListener('place_changed', function(){
    directionsDisplay.setMap(null);
    icon = 'images/youAreHere.png';
    findResult = finderAutocomplete.getPlace();
    findLoc = findResult.geometry.location;
    if (addMarker) {
      addMarker.setVisible(false);
    }
    if (userLocation) {
      userLocation.setPosition(findLoc);
      userLocation.setVisible(true);
      viewModel.findNearest(userLocation);
    } else {
      userLocation = new google.maps.Marker(
      {
        title: "Your Location",
        position: findLoc,
        map: map,
        draggable:false,
        visible:true,
        icon: icon
      });
      map.setCenter(findLoc);
    }
  });//end finder autocomplete

  //add autocomplete to adder box
  var adderInput = document.getElementById('addLocationBox');
  var adderAutocomplete = new google.maps.places.Autocomplete(adderInput);

  adderAutocomplete.addListener('place_changed', function(){
    directionsDisplay.setMap(null);
    viewModel.hideAllMarkers();
    if (userLocation) {
      userLocation.setVisible(false);
    }
    addResult = adderAutocomplete.getPlace();
    addLoc = addResult.geometry.location;
    addMarker = new google.maps.Marker(
      {title: addResult.name,
      position: addLoc,
      map: map,
      draggable:false,
      visible:true,
      });
    map.setCenter(addLoc);
    addDetails = adderAutocomplete.getPlace();
  });//end adder autocopmlete

  adderAutocomplete.bindTo('bounds', map);
  directionsDisplay.setMap(map);
  viewModel.initializeMarkers();
  viewModel.showAllMarkers();
}//end of initialize map function