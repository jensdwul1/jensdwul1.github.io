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
/**
 * Handles the sign in button press.
 */
function toggleSignIn(login) {
    if (firebase.auth().currentUser) {
        // [START signout]
        firebase.auth().signOut();
        // [END signout]

        toastr.options.timeOut = 5000;
        toastr.warning('You have logged out.');
    } else {
        // Sign in with email and pass.
        // [START authwithemail]
        firebase.auth().signInWithEmailAndPassword(login.email, login.password).catch(function(error) {
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
    firebase.auth().createUserWithEmailAndPassword(register.email, register.password).catch(function(error) {
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
    firebase.auth().onAuthStateChanged(function(user) {
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
    var usr = firebase.auth().currentUser;
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
    var usr = firebase.auth().currentUser;
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
    var user = firebase.auth().currentUser;

    user.updatePassword(newPassword).then(function() {
        // Update successful.
        toastr.options.timeOut = 5000;
        toastr.success('Password updated.');
    }, function(error) {
        // An error happened.
    });
}
function updateEmail(newEmail){
    var user = firebase.auth().currentUser;
    user.updateEmail(newEmail).then(function() {
        // Update successful.
    }, function(error) {
        // An error happened.
    });
}
function getUserProfile(){
    var usr = firebase.auth().currentUser;
    if (usr != null) {
        var ref = firebase.database().ref('/users/' + usr.uid);
        ref.on("value", function(snapshot) {
            console.log(snapshot.val());
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
    var usr = firebase.auth().currentUser;
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
    var usr = firebase.auth().currentUser;
    firebase.database().ref('settings/' + usr.uid).set(settings);
}

/**
 * Sends an email verification to the user.
 */
function sendEmailVerification() {
    // [START sendemailverification]
    var usr = firebase.auth().currentUser;
    usr.sendEmailVerification().then(function() {
        // Email Verification sent!
        // [START_EXCLUDE]
        console.log('Email Verification Sent!');
        // [END_EXCLUDE]
    });
    // [END sendemailverification]
}
function sendPasswordReset() {
    var email = document.getElementById('email').value;
    // [START sendpasswordemail]
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        // Password Reset Email Sent!
        // [START_EXCLUDE]
        alert('Password Reset Email Sent!');
        // [END_EXCLUDE]
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/invalid-email') {
            alert(errorMessage);
        } else if (errorCode == 'auth/user-not-found') {
            alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
    });
    // [END sendpasswordemail];
}
