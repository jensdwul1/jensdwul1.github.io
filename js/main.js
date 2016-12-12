function ready(cb) {
    /in/.test(document.readyState)
    ? setTimeout(ready.bind(null, cb), 90)
    : cb();


};
/* Tiny snippet of material effects --one day i'll rewrite this to plain javascript */
$(window, document, undefined).ready(function() {

    $('input').blur(function() {
        var $this = $(this);
        if ($this.val())
            $this.addClass('used');
        else
            $this.removeClass('used');
    });

    var $ripples = $('.ripples');

    $ripples.on('click.Ripples', function(e) {

        var $this = $(this);
        var $offset = $this.parent().offset();
        var $circle = $this.find('.ripplesCircle');

        var x = e.pageX - $offset.left;
        var y = e.pageY - $offset.top;

        $circle.css({
            top: y + 'px',
            left: x + 'px'
        });

        $this.addClass('is-active');

    });

    $ripples.on('animationend webkitAnimationEnd mozAnimationEnd oanimationend MSAnimationEnd', function(e) {
        $(this).removeClass('is-active');
    });

});
var App = {};
ready(function(){

    App = {
        "_processing":{
            "value":false,
            "animating":false,
            "step":0,
            "quotes":["Fetching your position","Spinning the button","Checking if the city still exists","Asking google nicely for a map","They said no","Threatening google with a knife for a map","Serving map"],
            "animate":function(step){
                App._doekeewaButton.classList.add('doekeewa-animate-'+step);
                if(step > 0){
                    App._doekeewaByline.classList.add('visible');
                } else {
                    App._doekeewaByline.classList.remove('visible');
                }
            },
            "setQuotes":function(){
                var quote = this._processing.quotes[Math.floor(Math.random()*this._processing.quotes.length)];
                //App._doekeewaByline.
            }
        },
        "_location":{
            "_latitude":51.0500363,
            "_longitude":3.733,
            "setLocation":function(coords){
                this._latitude = coords.latitude;
                this._longitude = coords.longitude;
            },
            "getLocation":function(){
                var coords = getLocation();
                /*
                this._latitude = coords.latitude;
                this._longitude = coords.longitude;
                */
            },
        },
        "_weather":{
            "fetchTime": new Date(),
            "properties":{},
            "getWeather":function(){
                var weather = getWeather(App._location);
            }
        },
        "init": function() {
            this._isMobile = mobileAndTabletcheck();
            if(this._isMobile){
                document.querySelector('body').classList.add('isMobile');
            }
            App.Overlay.init();
            App.Navigation.init();
            App._location.getLocation();
            var self = this;
            this._unitTesting = false; // Unit Testing the features in ApplicationDbContext or not
            this._widthHandlebarsAndLoDash = true; // Use Handlebars Template Engine And LoDash or Not
            this._activityTypes = [];
            this._locations= {
                book: [],
                movie: [],
                sports: [],
                frisbee: [],
                badminton: [],
                drink: [],
                tree: []
            }
            this._initialLoad = true;
            this._frmLogin = document.querySelector('#frm-login'); // Cache Form Login
            this._frmRegister = document.querySelector('#frm-register'); // Cache Form Register
            this._frmProfile = document.querySelector('#frm-profile'); // Cache Form Profile
            this._frmForgot = document.querySelector('#frm-forgot'); // Cache Form ForgotPassword
            this.registerEventListeners(); // Register the Event Listeners for all present elements

			this._hbsCache = {};// Handlebars cache for templates
			this._hbsPartialsCache = {};// Handlebars cache for partials

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    self._user = user;
                    self.isAnon = user.isAnonymous;
                    // User is signed in.
                    /*
                    self._displayName = user.displayName;
                    self._email = user.email;
                    self._emailVerified = user.emailVerified;
                    self._photoURL = user.photoURL;
                    self._isAnonymous = user.isAnonymous;
                    self._uid = user.uid;
                    self._providerData = user.providerData;
                    */
                    if (!self._emailVerified) {

                    }
                    if(!user.isAnonymous){
                        self._profile = getUserProfile();
                        App.Navigation.updateNavigation(true);
                        App.Overlay.toggle('login','close');
                        App.Overlay.toggle('register','close');
                        //console.log("Is this initial load?",self._initialLoad);
                        if(self._initialLoad === false){
                            toastr.options.timeOut = 5000;
                            toastr.success('You have logged in.');

                        }
                    } else {
                        // User is signed out.
                        self._profile = null;
                        App.Navigation.updateNavigation(false);
                    }
                    App.Settings.init();

                } else {
                    // User is signed out.
                    self._profile = null;
                    App.Navigation.updateNavigation(false);
                    App.Settings.init();
                }

            });
            setTimeout(function(){
                self._initialLoad = false;
            },1000);
        },

        "registerEventListeners": function() {

            // Event Listeners for the Core
            this._doekeewaButton = document.querySelector('.app-button');
            this._doekeewaButton.addEventListener('click', getDoekeewa, false);
            this._doekeewaByline = document.querySelector('.app-byline');

            // Register all other forms
            this.registerForms();


        },
        "registerForms": function() {

            // Event Listeners for Form Login
            if(this._frmLogin != null) {
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmLogin.addEventListener('submit', function(ev) {
                    ev.preventDefault();
                    document.querySelector('[name="login_email"]').classList.remove('error');
                    document.querySelector('[name="login_password"]').classList.remove('error');
                    var error = false;
                    var errorMessages = [];
                    var email = Utils.trim(this.querySelectorAll('[name="login_email"]')[0].value);
                    var passWord = Utils.trim(this.querySelectorAll('[name="login_password"]')[0].value);

                    if(!(email !== 'undefined' && email.length > 4 && isValidEmailAddress(email))){document.querySelector('[name="login_email"]').className += ' error'; error = true; errorMessages.push('Please enter a valid email.')}
                    if(!(passWord !== 'undefined' && passWord.length > 5)){document.querySelector('[name="login_password"]').className += ' error'; error = true; errorMessages.push('Please enter a password of at least 6 characters.')}
                    if(!error){
                        var login = {
                            password: passWord,
                            email:email
                        };
                        signIn(login);
                    } else {
                        var message = prepErrors(errorMessages);
                        toastr.options.timeOut = 5000 * errorMessages.length;
                        toastr.error(message, 'You have some errors!');
                    }

                    return false;
                });
            }
            // Event Listeners for Form Register
            if(this._frmRegister != null) {
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmRegister.addEventListener('submit', function(ev) {
                    ev.preventDefault();
                    
                    document.querySelector('[name="register_email"]').classList.remove('error');
                    document.querySelector('[name="register_firstName"]').classList.remove('error');
                    document.querySelector('[name="register_lastName"]').classList.remove('error');
                    document.querySelector('[name="register_username"]').classList.remove('error');
                    document.querySelector('[name="register_password"]').classList.remove('error');
                    var error = false;
                    var errorMessages = [];
                    var email = Utils.trim(this.querySelectorAll('[name="register_email"]')[0].value);
                    var firstName = Utils.trim(this.querySelectorAll('[name="register_firstName"]')[0].value);
                    var lastName = Utils.trim(this.querySelectorAll('[name="register_lastName"]')[0].value);
                    var username = Utils.trim(this.querySelectorAll('[name="register_username"]')[0].value);
                    var passWord = Utils.trim(this.querySelectorAll('[name="register_password"]')[0].value);

                    if(!(email !== 'undefined' && email.length > 4 && isValidEmailAddress(email))){document.querySelector('[name="register_email"]').className += ' error'; error = true; errorMessages.push('Please enter a valid email.')}
                    if(!(passWord !== 'undefined' && passWord.length > 5)){document.querySelector('[name="register_password"]').className += ' error'; error = true; errorMessages.push('Please enter a password of at least 6 characters.')}
                    if(!(username !== 'undefined' && username.length > 4)){document.querySelector('[name="register_username"]').className += ' error'; error = true; errorMessages.push('Please pick a username of at least 4 characters.')}
                    if(!(lastName !== 'undefined' && lastName.length > 0)){document.querySelector('[name="register_lastName"]').className += ' error'; error = true; errorMessages.push('Please enter a surname.')}
                    if(!(firstName !== 'undefined' && firstName.length > 0)){document.querySelector('[name="register_firstName"]').className += ' error'; error = true; errorMessages.push('Please enter a first name.')}
                    if(!error){
                        var register = {
                            password: passWord,
                            email:email,
                            firstName: firstName,
                            lastName:lastName,
                            username:username,
                            avatar: "https://www.mautic.org/media/images/default_avatar.png"
                        };
                        handleSignUp(register);
                    } else {
                        var message = prepErrors(errorMessages);
                        toastr.options.timeOut = 5000 * errorMessages.length;
                        toastr.error(message, 'You have some errors!');
                    }

                    return false;
                });
            }

            // Event Listeners for Form Profile
            if(this._frmProfile != null) {
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmProfile.addEventListener('submit', function(ev) {
                    ev.preventDefault();
                    document.querySelector('[name="profile_email"]').classList.remove('error');
                    document.querySelector('[name="profile_firstName"]').classList.remove('error');
                    document.querySelector('[name="profile_lastName"]').classList.remove('error');
                    document.querySelector('[name="profile_username"]').classList.remove('error');
                    var error = false;
                    var errorMessages = [];
                    var email = Utils.trim(this.querySelectorAll('[name="profile_email"]')[0].value);
                    var firstName = Utils.trim(this.querySelectorAll('[name="profile_firstName"]')[0].value);
                    var lastName = Utils.trim(this.querySelectorAll('[name="profile_lastName"]')[0].value);
                    var username = Utils.trim(this.querySelectorAll('[name="profile_username"]')[0].value);

                    if(!(email !== 'undefined' && email.length > 4 && isValidEmailAddress(email))){document.querySelector('[name="profile_email"]').className += ' error'; error = true; errorMessages.push('Please enter a valid email.')}
                    if(!(username !== 'undefined' && username.length > 4)){document.querySelector('[name="profile_username"]').className += ' error'; error = true; errorMessages.push('Please pick a username of at least 4 characters.')}
                    if(!(lastName !== 'undefined' && lastName.length > 0)){document.querySelector('[name="profile_lastName"]').className += ' error'; error = true; errorMessages.push('Please enter a surname.')}
                    if(!(firstName !== 'undefined' && firstName.length > 0)){document.querySelector('[name="profile_firstName"]').className += ' error'; error = true; errorMessages.push('Please enter a first name.')}
                    if(!error){
                        var profile = {
                            email:email,
                            firstName: firstName,
                            lastName:lastName,
                            username:username,
                            score:App._profile.score,
                        };
                        updateUserProfile(profile);
                    } else {
                        var message = prepErrors(errorMessages);
                        toastr.options.timeOut = 5000 * errorMessages.length;
                        toastr.error(message, 'You have some errors!');
                    }

                    return false;
                });

            }

            // Event Listeners for Form forgot
            if(this._frmForgot != null) {
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmForgot.addEventListener('submit', function(ev) {
                    ev.preventDefault();
                    document.querySelector('[name="forgot_email"]').className = document.querySelector('[name="forgot_email"]').className.replace(new RegExp('(?:^|\\s)'+ 'error' + '(?:\\s|$)'), ' ');
                    var error = false;
                    var errorMessages = [];
                    var email = Utils.trim(this.querySelectorAll('[name="forgot_email"]')[0].value);

                    if(!(email !== 'undefined' && email.length > 4 && isValidEmailAddress(email))){document.querySelector('[name="forgot_email"]').className += ' error'; error = true; errorMessages.push('Please enter a valid email.')}
                    if(!error){
                        sendPasswordReset(email);
                    } else {
                        var message = prepErrors(errorMessages);
                        toastr.options.timeOut = 5000 * errorMessages.length;
                        toastr.error(message, 'You have some errors!');
                    }

                    return false;
                });

            }
        },
        'Profile':{
            "state":"view",
            "init":function(){
                //console.log('Profile: ',App._profile);
                for(var propertyName in App._profile) {
                    //console.log('Property Profile: ',propertyName);
                    document.querySelector('#frm-profile #profile_avatar_img').src = App._user.photoURL;

                    document.querySelector('#frm-profile #profile_firstName').value = App._profile.firstName;
                    document.querySelector('#frm-profile #profile_lastName').value = App._profile.lastName;
                    document.querySelector('#frm-profile #profile_username').value = App._user.displayName;
                    document.querySelector('#frm-profile #profile_email').value = App._user.email;
                }
                App.Profile.registerEventListeners();
            },
            "registerEventListeners": function() {
                document.querySelector('#frm-profile #profile_avatar').addEventListener('change', App.Profile.handleFileSelect, false);
                document.querySelector('#frm-profile .editToggle').addEventListener('click', App.Profile.toggleView, false);
                document.querySelector('#frm-profile .profile-submit').addEventListener('click', App.Profile.toggleView, false);
                document.querySelector('#frm-profile #profile_avatar_img').addEventListener('click', function(){
                    if(App.Profile.state == "edit"){
                        document.querySelector('#frm-profile #profile_avatar').click();
                    }
                }, false);
            },
            "setAvatar":function(url){
                document.querySelector('#frm-profile #profile_avatar').src = url;
            },
            "handleFileSelect":function(evt){
                evt.stopPropagation();
                evt.preventDefault();
                var file = evt.target.files[0];
                var metadata = {
                    'contentType': file.type
                };
                handleAvatarUpload(file,metadata);
            },
            "toggleView":function(){
                if(App.Profile.state === "view"){
                    document.querySelector('#frm-profile .editToggle').classList.add('hidden');
                    document.querySelector('#frm-profile #profile_avatar_img').classList.add('editable');
                    document.querySelector('#frm-profile .profile-submit').classList.remove('hidden');
                    document.querySelector('#frm-profile #profile_firstName').disabled = false;
                    document.querySelector('#frm-profile #profile_lastName').disabled = false
                    document.querySelector('#frm-profile #profile_username').disabled = false
                    document.querySelector('#frm-profile #profile_email').disabled = false;

                    App.Profile.state = "edit";
                } else if(App.Profile.state === "edit"){
                    document.querySelector('#frm-profile .editToggle').classList.remove('hidden');
                    document.querySelector('#frm-profile #profile_avatar_img').classList.remove('editable');
                    document.querySelector('#frm-profile .profile-submit').classList.add('hidden');
                    document.querySelector('#frm-profile #profile_firstName').disabled = true;
                    document.querySelector('#frm-profile #profile_lastName').disabled = true
                    document.querySelector('#frm-profile #profile_username').disabled = true
                    document.querySelector('#frm-profile #profile_email').disabled = true;
                    App.Profile.state = "view";
                }
            },
            "edit":function(){

            }
        },
        'Settings': {
            "properties": {
                "weather": true,
                "indoor": true,
                "outdoor": true,
            },
            "init": function (settings) {
                if(App._user && App._user.isAnon === false) {

                        var settings = App.Settings.properties;

                        var usr = firebase.auth().currentUser;

                        var ref = firebase.database().ref('/settings/' + usr.uid);
                        //console.log('REF',ref);

                        ref.on("value", function(snapshot) {
                            settings = snapshot.val();
                            //console.log('settings',settings);
                            for(var propertyName in App.Settings.properties) {
                                if(settings.hasOwnProperty(propertyName)){
                                    App.Settings.properties[propertyName] = settings[propertyName];
                                    document.querySelector('#frm-settings #setting_'+propertyName).checked = settings[propertyName];
                                }
                            }
                        }, function (error) {
                            console.log("An Error occured while loading your settings: " + error.code);
                            toastr.options.timeOut = 5000;
                            toastr.error("An error occured while loading your settings. Default settings have been applied.");
                            for(var propertyName in App.Settings.properties) {
                                document.querySelector('#frm-settings #setting_'+propertyName).checked = App.Settings.properties[propertyName];
                            }
                        });

                } else {
                    for(var propertyName in App.Settings.properties) {
                        document.querySelector('#frm-settings #setting_'+propertyName).checked = App.Settings.properties[propertyName];
                    }
                }

                if(App.Settings.properties.weather){
                    App._weather.getWeather();
                }
                App.Settings.registerEventListeners();

            },
            "registerEventListeners": function(){
                var settingInputs = document.querySelectorAll('#frm-settings input[type="checkbox"]');
                for(var i=0;i<settingInputs.length;i++) {
                    var settingInput = settingInputs[i];
                    settingInput.removeEventListener("click", ClickHandler);
                    settingInput.addEventListener('click', ClickHandler);
                }
                function ClickHandler(){
                    var self = this;
                    //console.log('Setting '+self.id+' Changed:',self.checked);
                    var propertyName = self.id.replace('setting_','');
                    App.Settings.properties[propertyName] = self.checked;
                    //console.log('Settings saving',App.Settings.properties);
                    if(App._user) {
                        setSettings(App.Settings.properties);
                    }
                }
            }
        },
        'Overlay':{
            'overlays':[],
            'init':function(){
                var overlays = document.querySelectorAll('.overlay');
                if(overlays != null && overlays.length > 0) {
                    var overlay = null;
                    for(var i=0;i<overlays.length;++i) {
                        overlay = overlays[i];
                        var entry = {
                            id:overlay.dataset.id,
                            state:overlay.dataset.state,
                        };
                        App.Overlay.overlays.push(entry);
                        if(entry.state === true){
                            overlay.className += " active";
                        }

                    }
                    var buttons = document.querySelectorAll('.overlay button[data-target]');

                    for(var i=0;i < buttons.length; ++i) {
                        var button = buttons[i];
                        button.addEventListener('click', function() {
                            var self = this;
                            //console.log("Target: ",self.dataset.target);
                            App.Overlay.toggle(self.dataset.target,'close');
                        });
                    }

                    /*
                     General linking behaviour is here > Should be moved to the general App Init when that is finished
                     */

                    var links = document.querySelectorAll(".overlay-link[data-target]");
                    for(var i=0;i<links.length;++i) {
                        var link = links[i];
                        link.addEventListener('click', function() {
                            var self = this;
                            //console.log("Target: ",self.dataset.target);
                            App.Overlay.toggle(self.dataset.target);
                        });
                    }
                }
            },
            "toggle":function(overlayId,override){
                override = override || 0;
                //console.log("Overlay:",overlayId);
                var overlay = document.querySelector('.overlay[data-id="'+overlayId+'"]');
                //console.log("Overlay:",overlay);
                var state = overlay.dataset.state;
                if(state == "false" && override === 0){
                    //console.log("Open Overlay");
                    App.Overlay.open(overlay);
                } else {
                    if(override !== null && override !== 0){
                        switch(override){
                            case "close":
                                //console.log("Close Overlay");
                                App.Overlay.close(overlay);
                                break;
                            case "open":
                                //console.log("Open Overlay");
                                App.Overlay.close(overlay);
                                break;
                            default:
                                //console.log("Close Overlay");
                                App.Overlay.close(overlay);
                                break;
                        }
                    } else {
                        //console.log("Close Overlay");
                        App.Overlay.close(overlay);
                    }
                }
            },
            'open':function(overlay){
                overlay.dataset.state = "true";
                overlay.className += " active";
                var inputs = overlay.querySelectorAll('input');
                //console.log('Inputs',inputs);
                for(var i=0;i<inputs.length;++i) {
                    var input = inputs[i];
                    dirtyChecker(input);
                }

            },
            'close':function(overlay){
                overlay.dataset.state = "false";
                overlay.className = overlay.className.replace(new RegExp('(?:^|\\s)'+ 'active' + '(?:\\s|$)'), ' ');
            }

        },
        'Navigation':{
            'object': document.querySelector('.navigation'),
            'toggler' : document.querySelector('.menu-toggle[data-target="navigation"]'),
            'state': document.querySelector('.navigation').dataset.state,
            'init':function(){
                App.Navigation.toggler.addEventListener('click', function() {
                    App.Navigation.toggle();
                });
                var hitboxOffNav = document.querySelector('.navigation-close-hitbox');
                hitboxOffNav.addEventListener('click', function() {
                    App.Navigation.close();
                });
                var navLinks = document.querySelectorAll(".navigation a");
                for(var i=0;i<navLinks.length;++i) {
                    var link = navLinks[i];
                    link.addEventListener('click', function() {
                        //console.log('Closing Menu');
                        App.Navigation.close();
                    });
                }
                var logout = document.querySelector('.logout');
                logout.addEventListener('click', function() {
                    logOut();
                });

            },
            "updateNavigation":function(state){
                var navLinks = document.querySelectorAll('.navigation a');
                for(var i=0;i<navLinks.length;++i) {
                    var link = navLinks[i];
                    link.classList.remove('hidden');
                    if(link.dataset.user === "anonymous"){
                        if(state){
                            link.className += " hidden";
                        }
                    } else if(link.dataset.user === "user"){
                        if(!state){
                            link.className += " hidden";
                        }
                    } else if(link.dataset.user === "all"){
                        //Somehow someway
                    }

                }

            },
            "toggle":function(){
                //console.log("App.Navigation:",navigationId);
                //console.log("App.Navigation status:",App.Navigation.state);
                if(App.Navigation.state == "false"){
                    //console.log("Open App.Navigation");
                    App.Navigation.open();
                } else {
                    //console.log("Close App.Navigation");
                    App.Navigation.close();
                }
            },
            'open':function(){
                App.Navigation.object.dataset.state = "true";
                App.Navigation.state = "true";
                App.Navigation.object.classList.add('active');
                App.Navigation.toggler.classList.add('active');
                document.querySelector('.wrapper').classList.add('navigation-open');
            },
            'close':function(){
                App.Navigation.object.dataset.state = "false";
                App.Navigation.state = "false";
                App.Navigation.object.classList.remove('active');
                App.Navigation.toggler.classList.remove('active');
                document.querySelector('.wrapper').classList.remove('navigation-open');
            }
        }
    };
    App.init();
});