// Initialize Firebase
var dbConfig = {
    apiKey: "AIzaSyD8FujceRme3cLsSW8h1THRF7Uuq4Y-cxM",
    authDomain: "doekeewa-ab67a.firebaseapp.com",
    databaseURL: "https://doekeewa-ab67a.firebaseio.com",
    storageBucket: "doekeewa-ab67a.appspot.com",
    messagingSenderId: "582732951659"
};
firebase.initializeApp(dbConfig);
var database = firebase.database();
var storageRef = firebase.storage().ref();
var auth = firebase.auth();
/**
 * Handles the sign in button press.
 */
function logOut() {
    if (auth.currentUser) {
        // [START signout]
        auth.signOut();
        // [END signout]

        toastr.options.timeOut = 5000;
        toastr.warning('You have logged out.');

        //Log in with anon
        signInAnonymous();
    }
}
function signIn(login){
    // Sign in with email and pass.
    // [START authwithemail]
    auth.signInWithEmailAndPassword(login.email, login.password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        switch(errorCode){
            case "auth/wrong-password":
                alert('The entered password is wrong.');
                break;
            case "auth/invalid-email":
                alert("This email is not valid.");
                break;
            case "auth/user-disabled":
                alert("You've been banned. Impressive.");
                break;
            case "auth/user-not-found":
                alert('This email is not registered.');
                break;
            default:
                alert(errorMessage);
                break;

        }
        console.log(error);
        // [END_EXCLUDE]
    });
}
function signInAnonymous(){
    firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
    });
    //console.log("Anonymously Authenticated");
}
/**
 * Handles the sign up button press.
 */
function handleSignUp(register) {

    // Sign in with email and pass.
    // [START createwithemail]
    auth.createUserWithEmailAndPassword(register.email, register.password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/weak-password') {
            //console.log('The password is too weak.');
            toastr.options.timeOut = 5000;
            toastr.error('The password is too weak.');
        } else {
            toastr.options.timeOut = 5000;
            toastr.error(errorMessage);
        }
        //console.log(error);
        // [END_EXCLUDE]
    });
    // [END createwithemail]

    // Can't do these actions straight after registration because it the request needs time to get processed
    auth.onAuthStateChanged(function(user) {
        // Update the profile with the register data
        createUserProfile(register);
        setTimeout(function(){
            // After Registration one needs an email - verification
            sendEmailVerification();
        },400);
    });

}

/**
 * Create User Profile
 */
function createUserProfile(data) {
    var usr = auth.currentUser;
    if (usr != null) {
        usr.updateProfile({
            displayName: data.username,
            photoURL: data.avatar
        }).then(function () {
            database.ref('users/' + usr.uid).set({
                firstName: data.firstName,
                lastName: data.lastName,
                score: 0
            });

            database.ref('settings/' + usr.uid).set({
                "weather": true,
                "indoor": true,
                "outdoor": true
            });
            toastr.options.timeOut = 5000;
            toastr.success('The registration was a success and you have been automatically logged in.', 'Registered and Logged in!');
        }, function (error) {
            // An error happened.
            toastr.options.timeOut = 5000;
            toastr.error("Error: [" + error.code + "] "+ error.message);
        });
    }
}


/**
 * Update User Profile
 */
function updateUserProfile(data) {
    var usr = auth.currentUser;
    if (usr != null) {
        usr.updateProfile({
            displayName: data.username,
            photoURL: data.avatar
        }).then(function () {
            database.ref('users/' + usr.uid).set({
                firstName: data.firstName,
                lastName: data.lastName,
                score: data.score
            });
            toastr.options.timeOut = 5000;
            toastr.success('Profile updated.');
        }, function (error) {
            // An error happened.
            toastr.options.timeOut = 5000;
            toastr.error("Error: [" + error.code + "] "+ error.message);
        });
    }
}


function updatePassword(newPassword){
    var user = auth.currentUser;

    user.updatePassword(newPassword).then(function() {
        // Update successful.
        toastr.options.timeOut = 5000;
        toastr.success('Password updated.');
    }, function(error) {
        // An error happened.
        toastr.options.timeOut = 5000;
        toastr.error("Error: [" + error.code + "] "+ error.message);
    });
}
function updateEmail(newEmail){
    var user = auth.currentUser;
    user.updateEmail(newEmail).then(function() {
        // Update successful.
    }, function(error) {
        // An error happened.
        toastr.options.timeOut = 5000;
        toastr.error("Error: [" + error.code + "] "+ error.message);
    });
}
function getUserProfile(){
    var usr = auth.currentUser;
    if (usr != null) {
        var ref = database.ref('/users/' + usr.uid);
        ref.on("value", function(snapshot) {
            //console.log(snapshot.val());
            App._profile = snapshot.val();
            App.Profile.init();
            return snapshot.val();
        }, function (error) {
            //console.log("Error: " + error.code);
            toastr.options.timeOut = 5000;
            toastr.error("Error: [" + error.code + "] "+ error.message);
            return null;
        });
    }
}
function getSettings(){
    var usr = auth.currentUser;
    if (usr != null) {
        var ref = database.ref('/settings/' + usr.uid);
        ref.on("value", function (snapshot) {
            //console.log(snapshot.val());
            return snapshot.val();
        }, function (error) {
            //console.log("Error: " + error.code);
            toastr.options.timeOut = 5000;
            toastr.error("Error: [" + error.code + "] "+ error.message);
            return null;
        });
    }
}
function setSettings(settings){
    var usr = auth.currentUser;
    database.ref('settings/' + usr.uid).set(settings);
}

function postActivity(activity){
    var usr = auth.currentUser;
    var newActivityKey = database.ref().child('activities').push().key;
    var updates = {};
    activity.id = newActivityKey;
    updates['/activities/' + newActivityKey] = activity;
    updates['/user-activities/' + usr.uid + '/' + newActivityKey] = activity;
    if(!App.isAnon){
        updates['/users/' + usr.uid + '/score'] = App._profile.score + activity.score;
    }

    return firebase.database().ref().update(updates);
}

/**
 * Sends an email verification to the user.
 */
function sendEmailVerification() {
    // [START sendemailverification]
    var usr = auth.currentUser;
    usr.sendEmailVerification().then(function() {
        // Email Verification sent!
        // [START_EXCLUDE]
        //console.log('Email Verification Sent!');
        // [END_EXCLUDE]
    });
    // [END sendemailverification]
}
function sendPasswordReset(email) {
    // [START sendpasswordemail]
    auth.sendPasswordResetEmail(email).then(function() {
        // Password Reset Email Sent!
        // [START_EXCLUDE]

        toastr.options.timeOut = 5000;
        toastr.success('Password Reset Email Sent!');
        // [END_EXCLUDE]
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/invalid-email') {
            toastr.options.timeOut = 5000;
            toastr.error("That email isn't valid.");
        } else if (errorCode == 'auth/user-not-found') {
            toastr.options.timeOut = 5000;
            toastr.error("That user isn't registered with us.");
        } else {
            toastr.options.timeOut = 5000;
            toastr.error("Error: [" + error.code + "] "+ error.message);
        }

        // [END_EXCLUDE]
    });
    // [END sendpasswordemail];
}

function handleAvatarUpload(file,metadata) {
    // Push to child path.
    // [START oncomplete]
    storageRef.child('img/avatars/' + file.name).put(file, metadata).then(function(snapshot) {
        //console.log('Uploaded', snapshot.totalBytes, 'bytes.');
        //console.log(snapshot.metadata);
        var url = snapshot.metadata.downloadURLs[0];
        //console.log('File available at', url);
        var usr = auth.currentUser;
        if (usr != null) {
            usr.updateProfile({
                displayName: usr.displayName,
                photoURL: url
            });
        }
        App.Profile.setAvatar(url);
    }).catch(function(error) {
        // [START onfailure]
        toastr.options.timeOut = 5000;
        toastr.error("Error: [" + error.code + "] "+ error.message);
        // [END onfailure]
    });
    // [END oncomplete]
}

function seedActivityTypes(){
    var i = 0;
    var activityTypesData = {
        0:{
            id:i++,
            name: "Rent a book",
            type:"indoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"2",
            goodWeather:"1",
            badWeather:"2"
        },
        1:{
            id:i++,
            name: "See a movie",
            type:"indoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"2",
            goodWeather:"1",
            badWeather:"2"
        },
        2:{
            id:i++,
            name: "Do some sportsball",
            type:"indoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"2",
            goodWeather:"2",
            badWeather:"2"
        },
        3:{
            id:i++,
            name: "It's time to play extreme frisbee",
            type:"outdoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"2",
            goodWeather:"3",
            badWeather:"1"
        },
        4:{
            id:i++,
            name: "Play some badminton",
            type:"outdoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"2",
            goodWeather:"3",
            badWeather:"2"
        },
        5:{
            id:i++,
            name: "Get a drink",
            type:"indoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"2",
            goodWeather:"2",
            badWeather:"3"
        },
    };
    database.ref('activitytypes').set(activityTypesData);

}
function getLocation(){

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    function error(err) {
        toastr.options.timeOut = 5000;
        toastr.error('ERROR(' + err.code + '): ' + err.message);
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, options);

    } else {
        toastr.options.timeOut = 5000;
        toastr.error("Geolocation is not supported by this browser.");
    }


    function success(pos) {
        var crd = pos.coords;
        /*
         console.log('Your current position is:');
         console.log('Latitude : ' + crd.latitude);
         console.log('Longitude: ' + crd.longitude);
         console.log('More or less ' + crd.accuracy + ' meters.');
         */
        App._location.setLocation(crd);
        return crd;
    };


}
function getWeather(location){
    this.API_URL_PREFIX = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Fapi.openweathermap.org%2Fdata%2F2.5%2Fweather%3F';
    this.API_URL_SUFFIX = '%26APPID%3D5f05044f9f56b8f03c563bcdf64547e9%26units%3Dmetric%22&format=json&diagnostics=true&callback=json_callback';
    // The results within the JSON-object
    this.results;
    // Hack --> Closure
    var that = this;

    var API_URL = this.API_URL_PREFIX + 'lat%3D' + location._latitude + '%26lon%3D' + location._longitude + this.API_URL_SUFFIX;
    //console.log(API_URL);
    Utils.getJSONPByPromise(API_URL).then(
        function(data) {
            //console.log('Data',data.query.results.json);
            that.results = data.query.results.json;
            App._weather.properties = that.results;
            App._weather.fetchTime = new Date();
            App._weather.state = ((App._weather.properties.main.humidity > 50)?"bad":"good");
            if(App._weather.properties.main.humidity >= 30 && App._weather.properties.main.humidity <= 60){
                App._weather.state = "neutral";
            }
            //console.log('Weather be like',that.results);
            return that.results ;
        },
        function(error) {
            console.log("Error: ",error);
        }
    );
}
function getDoekeewa(){
    App._processing.value = true;
    App._processing.animating = true;
    App._processing.step = 1;
    App._processing.animate(App._processing.step);
    App._processing.setQuotes();
    attempts = 0;
    fetched = false;
    getRandomActivityType();
}
var lastActivityType = 0;
function getRandomActivityType(){
    var date = new Date();
    date = Date.now();
    var last = App._weather.properties.dt; // or a previous millisecond timestamp
    var activityTypesArray = [];

    database.ref('/activitytypes').once('value').then(function(snapshot) {
        //console.log('These are the activityTypes', snapshot.val());
        App._activityTypes = snapshot.val();
        if(!App.Settings.properties.weather){
            App._weather.state = "neutral";
        }
        if ( ( date - last ) > ( 10 * 60 * 1000 ) || !App.Settings.properties.weather) {
            for(var i=0;i<App._activityTypes.length;) {
                if(App.Settings.properties.indoor && App.Settings.properties.outdoor){
                    //console.log('Weather is?', App._activityTypes[i]);
                    for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                        //console.log('Activity',App._activityTypes[i].id);
                        if(App._activityTypes[i].id !== lastActivityType){
                            activityTypesArray.push(App._activityTypes[i].id);
                        }
                    }
                } else if(App.Settings.properties.indoor){
                    //console.log('We get here? - Indoor');
                    for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                        if(App._activityTypes[i].type == 'indoor' && App._activityTypes[i].id !== lastActivityType){
                            activityTypesArray.push(App._activityTypes[i].id);
                        }
                    }
                } else if(App.Settings.properties.outdoor){
                    //console.log('We get here? - Outdoor');
                    for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                        if(App._activityTypes[i].type == 'outdoor' && App._activityTypes[i].id !== lastActivityType){
                            activityTypesArray.push(App._activityTypes[i].id);
                        }
                    }
                } else {
                    for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                        if(App._activityTypes[i].id !== lastActivityType){
                            activityTypesArray.push(App._activityTypes[i].id);
                        }
                    }
                }
                i++;
            }
            var activityType = activityTypesArray[Math.floor(Math.random()*activityTypesArray.length)];
            lastActivityType = activityType;
            getActivity(activityType);
        } else {
            //console.log('Weather is outdated');
            getWeather(App._location), getRandomActivityType();
        }
    });

}

var fetched = false;
var attempts = 0;
function getActivity(type){
    switch(type){
        case 0://Book
            //console.log("Activity Type: Book");
            if(App._locations.book.length > 0){
                //console.log("Prep for Closest Calculation",App._locations.book);
                var userLocation = {latitude: App._location._latitude,longitude: App._location._longitude};
                var destination = calculateClosest(userLocation,App._locations.book);
                setTimeout(function(){
                    App.updateUI(type);
                    mapRoute(userLocation,destination);
                },1000);
            } else {
                if(fetched === false){
                    fetched = true;
                    getBookLocations();
                    getActivity(type);
                } else {
                    if(attempts < 10){
                        //console.log("Try again after 1000ms");
                        ++attempts;
                        setTimeout(function(){
                            getActivity(type);
                        },1000);
                    } else {
                        console.log('We have failed my lord.')
                    }
                }
            }
            break;
        case 1://Movie
            //console.log("Activity Type: Movie");
            if(App._locations.movie.length > 0){
                //console.log("Prep for Closest Calculation",App._locations.movie);
                var userLocation = {latitude: App._location._latitude,longitude: App._location._longitude};
                var destination = calculateClosest(userLocation,App._locations.movie);
                setTimeout(function(){
                    App.updateUI(type);
                    mapRoute(userLocation,destination);
                },1000);
            } else {
                if(fetched === false){
                    fetched = true;
                    getMovieLocations();
                    getActivity(type);
                } else {
                    if(attempts < 10){
                        //console.log("Try again after 1000ms");
                        ++attempts;
                        setTimeout(function(){
                            getActivity(type);
                        },1000);
                    } else {
                        console.log('We have failed my lord.')
                    }
                }
            }

            break;
        case 2://Sports
            //console.log("Activity Type: Sports");
            if(App._locations.sports.length > 0){
                //console.log("Prep for Closest Calculation",App._locations.sports);
                var userLocation = {latitude: App._location._latitude,longitude: App._location._longitude};
                var destination = calculateClosest(userLocation,App._locations.sports);
                setTimeout(function(){
                    App.updateUI(type);
                    mapRoute(userLocation,destination);
                },1000);
            } else {
                if(fetched === false){
                    fetched = true;
                    getSportsLocations();
                    getActivity(type);
                } else {
                    if(attempts < 10){
                        //console.log("Try again after 1000ms");
                        ++attempts;
                        setTimeout(function(){
                            getActivity(type);
                        },1000);
                    } else {
                        console.log('We have failed my lord.')
                    }
                }
            }
            break;
        case 3://Frisbee
            //console.log("Activity Type: Frisbee");
            if(App._locations.frisbee.length > 0){
                //console.log("Prep for Closest Calculation",App._locations.frisbee);
                var userLocation = {latitude: App._location._latitude,longitude: App._location._longitude};
                var destination = calculateClosest(userLocation,App._locations.frisbee);
                setTimeout(function(){
                    App.updateUI(type);
                    mapRoute(userLocation,destination);
                },1000);
            } else {
                if(fetched === false){
                    fetched = true;
                    getFrisbeeLocations();
                    getActivity(type);
                } else {
                    if(attempts < 10){
                        //console.log("Try again after 1000ms");
                        ++attempts;
                        setTimeout(function(){
                            getActivity(type);
                        },1000);
                    } else {
                        console.log('We have failed my lord.')
                    }
                }
            }

            break;
        case 4://Badminton
            //console.log("Activity Type: Badminton");
            if(App._locations.badminton.length > 0){
                //console.log("Prep for Closest Calculation",App._locations.badminton);
                var userLocation = {latitude: App._location._latitude,longitude: App._location._longitude};
                var destination = calculateClosest(userLocation,App._locations.badminton);
                setTimeout(function(){
                    App.updateUI(type);
                    mapRoute(userLocation,destination);
                },1000);
            } else {
                if(fetched === false){
                    fetched = true;
                    getBadmintonLocations();
                    getActivity(type);
                } else {
                    if(attempts < 10){
                        //console.log("Try again after 1000ms");
                        ++attempts;
                        setTimeout(function(){
                            getActivity(type);
                        },1000);
                    } else {
                        console.log('We have failed my lord.')
                    }
                }
            }
            break;
        case 5://Get a drink
            //console.log("Activity Type: Drink");
            if(App._locations.drink.length > 0){
                //console.log("Prep for Closest Calculation",App._locations.drink);
                var userLocation = {latitude: App._location._latitude,longitude: App._location._longitude};
                var destination = calculateClosest(userLocation,App._locations.drink);
                setTimeout(function(){
                    App.updateUI(type);
                    mapRoute(userLocation,destination);
                },1000);
            } else {
                if(fetched === false){
                    fetched = true;
                    getDrinkLocations();
                    getActivity(type);
                } else {
                    if(attempts < 10){
                        //console.log("Try again after 1000ms");
                        ++attempts;
                        setTimeout(function(){
                            getActivity(type);
                        },1000);
                    } else {
                        console.log('We have failed my lord.')
                    }
                }
            }
            break;

    }
}

function calculateClosest(userLocation,activityLocations){
    var mindif = 99999;
    var closest;
    //console.log("All Locations",activityLocations);
    //console.log("All Locations Length",activityLocations.length);
    for (var i = 0; i < activityLocations.length; ) {
        var dif = PythagorasEquirectangular(userLocation.latitude, userLocation.longitude, activityLocations[i][0], activityLocations[i][1]);
        if (dif < mindif) {
            closest = i;
            mindif = dif;
        }
        ++i
    }

    // echo the nearest activityLocation
    //console.log(activityLocations[closest]);
    App._processing.currentCoords = activityLocations[closest];
    return activityLocations[closest];
}

function mapRoute(userLocation,destination){
    if(App._processing.animating){
        App._processing.step++;
        App._processing.animate(App._processing.step);
    }
    App.Gmap.load();
    setTimeout(function(){
        App.Gmap.update(userLocation,destination);
        createActivity();
    },1000)
}

function createActivity(){
    
}

/* DATASETS */
//DATA: Bibliotheek
function getBookLocations(){
    this.API_URL_PREFIX = 'https://datatank.stad.gent/4/';
    this.API_URL_SUFFIX = 'cultuursportvrijetijd/bibliotheek.geojson?callback=json_callback';
    // The results within the JSON-object
    this.results;
    var that = this;
    var API_URL = this.API_URL_PREFIX + this.API_URL_SUFFIX;
    //console.log(API_URL);
    Utils.getJSONByPromise(API_URL).then(
        function(data) {
            that.results = data.coordinates;
            //console.log('Weather be like',that.results);
            //console.log('RESULTS', that.results);
            App._locations.book = that.results;
            return that.results;
        },
        function(error) {
            console.log("Error: ",error);
        }
    );
}

//DATA: Movie
function getMovieLocations(){
    this.API_URL_PREFIX = 'https://datatank.stad.gent/4/';
    this.API_URL_SUFFIX = 'cultuursportvrijetijd/bioscopen.geojson?callback=json_callback';
    // The results within the JSON-object
    this.results;
    var that = this;
    var API_URL = this.API_URL_PREFIX + this.API_URL_SUFFIX;
    //console.log(API_URL);
    Utils.getJSONByPromise(API_URL).then(
        function(data) {
            that.results = data.coordinates;
            //console.log('Weather be like',that.results);
            //console.log('RESULTS', that.results);
            App._locations.movie = that.results;
            return that.results;
        },
        function(error) {
            console.log("Error: ",error);
        }
    );
}

//DATA: Sporthal
function getSportsLocations(){
    this.API_URL_PREFIX = 'https://datatank.stad.gent/4/';
    this.API_URL_SUFFIX = 'cultuursportvrijetijd/sportcentra.geojson?callback=json_callback';
    // The results within the JSON-object
    this.results;
    var that = this;
    var API_URL = this.API_URL_PREFIX + this.API_URL_SUFFIX;
    //console.log(API_URL);
    Utils.getJSONByPromise(API_URL).then(
        function(data) {
            that.results = data.coordinates;
            App._locations.sports = that.results;
            return that.results;
        },
        function(error) {
            console.log("Error: ",error);
        }
    );
}

//DATA: Frisbee
function getFrisbeeLocations(){
    this.API_URL_PREFIX = 'https://datatank.stad.gent/4/';
    this.API_URL_SUFFIX = 'cultuursportvrijetijd/buurtsportlocaties.json?callback=json_callback';
    // The results within the JSON-object
    this.results;
    var that = this;
    var API_URL = this.API_URL_PREFIX + this.API_URL_SUFFIX;
    //console.log(API_URL);
    Utils.getJSONByPromise(API_URL).then(
        function(data) {
            that.results = data.features;
            for (var i = 0; i < that.results.length; i++) {

                if(that.results[i].geometry.type == "Point"){
                    that.results[i] = that.results[i].geometry.coordinates;
                }else if(that.results[i].geometry.type == "Polygon") {
                    that.results[i] = that.results[i].geometry.coordinates[0][0];
                }
            }

            App._locations.frisbee = that.results;
            return that.results;
        },
        function(error) {
            console.log("Error: ",error);
        }
    );
}

//DATA: Badminton
function getBadmintonLocations(){
    this.API_URL_PREFIX = 'https://datatank.stad.gent/4/';
    this.API_URL_SUFFIX = 'milieuennatuur/parken.geojson?callback=json_callback';
    // The results within the JSON-object
    this.results;
    var that = this;
    var API_URL = this.API_URL_PREFIX + this.API_URL_SUFFIX;
    //console.log(API_URL);
    Utils.getJSONByPromise(API_URL).then(
        function(data) {
            that.results = data.coordinates;
            for (var i = 0; i < that.results.length; i++) {
                that.results[i] = that.results[i][0][0];
            }

            App._locations.badminton = that.results;
            return that.results;
        },
        function(error) {
            console.log("Error: ",error);
        }
    );
}

//DATA: Drink
function getDrinkLocations(){
    this.API_URL_PREFIX = '/assets/files/';
    this.API_URL_SUFFIX = 'cafes.json?callback=json_callback';
    // The results within the JSON-object
    this.results;
    var that = this;
    var API_URL = this.API_URL_PREFIX + this.API_URL_SUFFIX;
    //console.log(API_URL);
    Utils.getJSONByPromise(API_URL).then(
        function(data) {
            that.results = data.features;
            for (var i = 0; i < that.results.length; i++) {

                if(that.results[i].geometry.type == "Point"){
                    that.results[i] = that.results[i].geometry.coordinates;
                }else if(that.results[i].geometry.type == "Polygon") {
                    that.results[i] = that.results[i].geometry.coordinates[0][0];
                }
            }


            App._locations.drink = that.results;
            return that.results;
        },
        function(error) {
            console.log("Error: ",error);
        }
    );
}