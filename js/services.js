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
function toggleSignIn(login) {
    if (auth.currentUser) {
        // [START signout]
        auth.signOut();
        // [END signout]

        toastr.options.timeOut = 5000;
        toastr.warning('You have logged out.');
    } else {
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
            goodWeather:"1",
            badWeather:"2"
        },
        1:{
            id:i++,
            name: "See a movie",
            goodWeather:"1",
            badWeather:"2"
        },
        2:{
            id:i++,
            name: "Do some sportsball",
            goodWeather:"1",
            badWeather:"1"
        },
        3:{
            id:i++,
            name: "It's time to play extreme frisbee",
            goodWeather:"1",
            badWeather:"0"
        },
        4:{
            id:i++,
            name: "Play some badminton",
            goodWeather:"1",
            badWeather:"1"
        },
        5:{
            id:i++,
            name: "Get a drink",
            goodWeather:"1",
            badWeather:"1"
        },
        6:{
            id:i++,
            name: "Hug a tree",
            goodWeather:"2",
            badWeather:"0"
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
            //console.log('Weather be like',that.results);
            return that.results ;
        },
        function(error) {
            console.log(error);
        }
    );
}
function getDoekeewa(){
    var activityType = getRandomActivityType();
    var actitivity = getActivity(activityType);

}
function getRandomActivityType(){
    var date = new Date();
    date = Date.now();
    var last = App._weather.properties.dt; // or a previous millisecond timestamp
    var activityTypesArray = [];
    if ( ( date - last ) > ( 10 * 60 * 1000 ) ) {
        // If the weather time is less than ten minutes proceed with getting activitytypes
        if(App._activityTypes.length > 0){
            for(var i=0;i<App._activityTypes.length;) {
                for(var o=0;o<App._activityTypes[i][App._weather.state+'Weather'];o++){
                        activityTypesArray.push(App._activityTypes[i].id);
                }
                i++;
            }
            console.log('ActivityTypeArray',activityTypesArray);
            var activityType = activityTypesArray[Math.floor(Math.random()*activityTypesArray.length)];
            return activityType;
        } else {
            firebase.database().ref('/activitytypes').once('value').then(function(snapshot) {
                //console.log('These are the activityTypes', snapshot.val());
                App._activityTypes = snapshot.val();
                getRandomActivityType();
            });
        }

    } else {
        getWeather(App._location), getRandomActivityType();
    }
}

function getActivity(type){
    switch(type){
        case 0://Book
            if(App._locations.book.length > 0){
                var mindif = 99999;
                var closest;

                for (var i = 0; i < App._locations.book.length; ++i) {
                    var dif = PythagorasEquirectangular(App._location._latitude, App._location._longitude, App._locations.book[i][1], App._locations.book[i][2]);
                    if (dif < mindif) {
                        closest = i;
                        mindif = dif;
                    }
                }

                // echo the nearest city
                console.log(App._locations.book[closest]);
            } else {
                var locations = getBookLocations();
                getActivity(0);
            }
            break;
        case 1://Movie

            break;
        case 2://Sports

            break;
        case 3://Frisbee

            break;
        case 4://Badminton

            break;
        case 5://Get a drink

            break;
        case 6://Hug a tree

            break;
        default:
            break;
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
            console.log('RESULTS', that.results);
            App._locations.book = that.results;
            return that.results;
        },
        function(error) {
            console.log(error);
        }
    );


}