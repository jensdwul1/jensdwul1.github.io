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
    console.log("Anonymously Authenticated");
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
            console.log('The password is too weak.');
        } else {
            alert(errorMessage);
        }
        console.log(error);
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
            firebase.database().ref('users/' + usr.uid).set({
                firstName: data.firstName,
                lastName: data.lastName,
                score: 0
            });

            firebase.database().ref('settings/' + usr.uid).set({
                "weather": true,
                "indoor": true,
                "outdoor": true
            });
            toastr.options.timeOut = 5000;
            toastr.success('The registration was a success and you have been automatically logged in.', 'Registered and Logged in!');
        }, function (error) {
            // An error happened.
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
            firebase.database().ref('users/' + usr.uid).set({
                firstName: data.firstName,
                lastName: data.lastName,
                score: data.score
            });
            toastr.options.timeOut = 5000;
            toastr.success('Profile updated.');
        }, function (error) {
            // An error happened.
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
    });
}
function updateEmail(newEmail){
    var user = auth.currentUser;
    user.updateEmail(newEmail).then(function() {
        // Update successful.
    }, function(error) {
        // An error happened.
    });
}
function getUserProfile(){
    var usr = auth.currentUser;
    if (usr != null) {
        var ref = firebase.database().ref('/users/' + usr.uid);
        ref.on("value", function(snapshot) {
            //console.log(snapshot.val());
            App._profile = snapshot.val();
            App.Profile.init();
            return snapshot.val();
        }, function (error) {
            console.log("Error: " + error.code);
            return null;
        });
    }
}
function getSettings(){
    var usr = auth.currentUser;
    if (usr != null) {
        var ref = firebase.database().ref('/settings/' + usr.uid);
        ref.on("value", function (snapshot) {
            //console.log(snapshot.val());
            return snapshot.val();
        }, function (error) {
            console.log("Error: " + error.code);
            return null;
        });
    }
}
function setSettings(settings){
    var usr = auth.currentUser;
    firebase.database().ref('settings/' + usr.uid).set(settings);
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
        console.log('Email Verification Sent!');
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
        }
        console.log(error);
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
        console.log('File available at', url);
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
        console.error('Upload failed:', error);
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
            neutralWeather:"1",
            goodWeather:"1",
            badWeather:"2"
        },
        1:{
            id:i++,
            name: "See a movie",
            type:"indoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"1",
            goodWeather:"1",
            badWeather:"2"
        },
        2:{
            id:i++,
            name: "Do some sportsball",
            type:"indoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"1",
            goodWeather:"1",
            badWeather:"1"
        },
        3:{
            id:i++,
            name: "It's time to play extreme frisbee",
            type:"outdoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"1",
            goodWeather:"1",
            badWeather:"0"
        },
        4:{
            id:i++,
            name: "Play some badminton",
            type:"outdoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"1",
            goodWeather:"1",
            badWeather:"1"
        },
        5:{
            id:i++,
            name: "Get a drink",
            type:"indoor",
            url:"/assets/img/activity/"+(i - 1)+".png",
            neutralWeather:"1",
            goodWeather:"1",
            badWeather:"1"
        },
    };
    firebase.database().ref('activitytypes').set(activityTypesData);

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
    this.API_URL_PREFIX = 'http://api.openweathermap.org/data/2.5/weather?';
    this.API_URL_SUFFIX = '&APPID=5f05044f9f56b8f03c563bcdf64547e9&units=metric&callback=json_callback';
    // The results within the JSON-object
    this.results;
    // Hack --> Closure
    var that = this;

    var API_URL = this.API_URL_PREFIX + 'lat=' + location._latitude + '&lon=' + location._longitude + this.API_URL_SUFFIX;
    //console.log(API_URL);
    Utils.getJSONPByPromise(API_URL).then(
        function(data) {
            that.results = data;
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
            console.log(error);
        }
    );
}
function getDoekeewa(){
    App._processing.value = true;
    App._processing.animating = true;
    App._processing.step = 1;
    App._processing.animate(App._processing.step);
    App._processing.setQuotes();
    getRandomActivityType();
}
function getRandomActivityType(){
    var date = new Date();
    date = Date.now();
    var last = App._weather.properties.dt; // or a previous millisecond timestamp
    var activityTypesArray = [];

    firebase.database().ref('/activitytypes').once('value').then(function(snapshot) {
        //console.log('These are the activityTypes', snapshot.val());
        App._activityTypes = snapshot.val();
        if(App.Settings.properties.weather){
            if ( ( date - last ) > ( 10 * 60 * 1000 ) ) {
                for(var i=0;i<App._activityTypes.length;) {
                    if(App.Settings.properties.indoor && App.Settings.properties.outdoor){
                        for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                            activityTypesArray.push(App._activityTypes[i].id);
                        }
                    } else if(App.Settings.properties.indoor){
                        for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                            if(App._activityTypes[i].type == 'indoor'){
                                activityTypesArray.push(App._activityTypes[i].id);
                            }
                        }
                    } else if(App.Settings.properties.outdoor){
                        for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                            if(App._activityTypes[i].type == 'outdoor'){
                                activityTypesArray.push(App._activityTypes[i].id);
                            }
                        }
                    } else {
                        for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                            activityTypesArray.push(App._activityTypes[i].id);
                        }
                    }
                    i++;
                }
                var activityType = activityTypesArray[Math.floor(Math.random()*activityTypesArray.length)];
                getActivity(activityType);
            } else {
                getWeather(App._location), getRandomActivityType();
            }
        } else {
            for(var i=0;i<App._activityTypes.length;i++) {
                if(App.Settings.properties.indoor && App.Settings.properties.outdoor) {
                    activityTypesArray.push(App._activityTypes[i].id);
                } else if(App.Settings.properties.indoor && App._activityTypes[i].type == "indoor"){
                    activityTypesArray.push(App._activityTypes[i].id);
                } else if(App.Settings.properties.outdoor && App._activityTypes[i].type == "outdoor"){
                    activityTypesArray.push(App._activityTypes[i].id);
                } else {
                    activityTypesArray.push(App._activityTypes[i].id);
                }
            }
            var activityType = activityTypesArray[Math.floor(Math.random()*activityTypesArray.length)];
            getActivity(activityType);
        }
    });

}

var fetched = false;
var attempts = 0;
function getActivity(type){
    switch(type){
        case 0://Book
            console.log("Activity Type: Book");
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
                        console.log("Try again after 1000ms");
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
            console.log("Activity Type: Movie");
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
                        console.log("Try again after 1000ms");
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
            console.log("Activity Type: Sports");
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
                        console.log("Try again after 1000ms");
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
            console.log("Activity Type: Frisbee");
            /* DATASET IS BROKEN -- REPORTED @ Pieter Colpaert
            if(App._locations.frisbee.length > 0){
                console.log("Prep for Closest Calculation",App._locations.frisbee);
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
                        console.log("Try again after 1000ms");
                        ++attempts;
                        setTimeout(function(){
                            getActivity(type);
                        },1000);
                    } else {
                        console.log('We have failed my lord.')
                    }
                }
            }
            */
            getActivity(4);
            break;
        case 4://Badminton
            console.log("Activity Type: Badminton");
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
                        console.log("Try again after 1000ms");
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
            console.log("Activity Type: Drink");
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
                        console.log("Try again after 1000ms");
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

    for (var i = 0; i < activityLocations.length; ++i) {
        var dif = PythagorasEquirectangular(userLocation.latitude, userLocation.longitude, activityLocations[i][0], activityLocations[i][1]);
        if (dif < mindif) {
            closest = i;
            mindif = dif;
        }
    }

    // echo the nearest activityLocation
    console.log(activityLocations[closest]);
    return activityLocations[closest];
}

function mapRoute(userLocation,destination){
    if(App._processing.animating){
        App._processing.step++;
        App._processing.animate(App._processing.step);
    }

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
            console.log(error);
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
            console.log(error);
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
            console.log(error);
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
                //that.results[i] = that.results[i].geometry.coordinates;
            }

            App._locations.frisbee = that.results;
            return that.results;
        },
        function(error) {
            console.log(error);
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
            console.log(error);
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
                that.results[i] = that.results[i].geometry.coordinates[0][0];
            }

            App._locations.drink = that.results;
            return that.results;
        },
        function(error) {
            console.log(error);
        }
    );
}