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

ready(function(){

    var App = {
        "init": function() {
            this._unitTesting = false; // Unit Testing the features in ApplicationDbContext or not
            this._widthHandlebarsAndLoDash = true; // Use Handlebars Template Engine And LoDash or Not



            this._frmLogin = document.querySelector('#frm-login'); // Cache Form Login
            this._frmRegister = document.querySelector('#frm-register'); // Cache Form Login
            this.registerEventListeners(); // Register the Event Listeners for all present elements

			this._hbsCache = {};// Handlebars cache for templates
			this._hbsPartialsCache = {};// Handlebars cache for partials

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in.
                    var displayName = user.displayName;
                    var email = user.email;
                    var emailVerified = user.emailVerified;
                    var photoURL = user.photoURL;
                    var isAnonymous = user.isAnonymous;
                    var uid = user.uid;
                    var providerData = user.providerData;

                    if (!emailVerified) {

                    }
                    Navigation.updateNavigation(true);
                    Overlay.toggle('login','close');
                } else {
                    // User is signed out.
                    Navigation.updateNavigation(false);
                }

            });

        },

        "registerEventListeners": function() {

            // Event Listeners for Form Login
            if(this._frmLogin != null) {
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmLogin.addEventListener('submit', function(ev) {
                    ev.preventDefault();
                    document.querySelector('[name="login_email"]').className = document.querySelector('[name="login_email"]').className.replace(new RegExp('(?:^|\\s)'+ 'error' + '(?:\\s|$)'), ' ');
                    document.querySelector('[name="login_password"]').className = document.querySelector('[name="login_password"]').className.replace(new RegExp('(?:^|\\s)'+ 'error' + '(?:\\s|$)'), ' ');
                    var error = false;
                    var email = Utils.trim(this.querySelectorAll('[name="login_email"]')[0].value);
                    var passWord = Utils.trim(this.querySelectorAll('[name="login_password"]')[0].value);

                    function isValidEmailAddress(emailAddress) {
                        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
                        return pattern.test(emailAddress);
                    };
                    if(!(email !== 'undefined' && email.length > 4 && isValidEmailAddress(email))){document.querySelector('[name="login_email"]').className += ' error'; error = true;}
                    if(!(passWord !== 'undefined' && passWord.length > 5)){document.querySelector('[name="login_password"]').className += ' error'; error = true;}
                    if(!error){
                        var login = {
                            password: passWord,
                            email:email
                        };
                        toggleSignIn(login);
                    }

                    return false;
                });
            }
            // Event Listeners for Form Register
            if(this._frmRegister != null) {
                /*
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmRegister.addEventListener('submit', function(ev) {
                    ev.preventDefault();

                    var userName = Utils.trim(this.querySelectorAll('[name="username"]')[0].value);
                    var passWord = Utils.trim(this.querySelectorAll('[name="password"]')[0].value);
                    var result = self._userManager.register(userName, passWord);
                    if(result == null) {

                    } else if(result == false) {

                    } else {
                        self._activeUser = result; // User is Logged in
                        self.updateUI();
                    }

                    return false;
                });
                */
            }


        },
        "updateUI": function() {

        },
    };
    var Overlay = {
        'overlays':[],
        'init':function(){
            var overlays = document.querySelectorAll('.overlay');
            if(overlays != null && overlays.length > 0) {
                var overlay = null;
                for(var i=0;i<overlays.length;i++) {
                    overlay = overlays[i];
                    var entry = {
                        id:overlay.dataset.id,
                        state:overlay.dataset.state,
                    };
                    Overlay.overlays.push(entry);
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
                        Overlay.toggle(self.dataset.target,'close');
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
                        Overlay.toggle(self.dataset.target);
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
                Overlay.open(overlay);
            } else {
                if(override !== null && override !== 0){
                    switch(override){
                        case "close":
                            //console.log("Close Overlay");
                            Overlay.close(overlay);
                            break;
                        case "open":
                            //console.log("Open Overlay");
                            Overlay.close(overlay);
                            break;
                        default:
                            //console.log("Close Overlay");
                            Overlay.close(overlay);
                            break;
                    }
                } else {
                    //console.log("Close Overlay");
                    Overlay.close(overlay);
                }
            }
        },
        'open':function(overlay){
            overlay.dataset.state = "true";
            overlay.className += " active";
        },
        'close':function(overlay){
            overlay.dataset.state = "false";
            overlay.className = overlay.className.replace(new RegExp('(?:^|\\s)'+ 'active' + '(?:\\s|$)'), ' ');
        }

    }
    var Navigation = {
        'object': document.querySelector('.navigation'),
        'toggler' : document.querySelector('.menu-toggle[data-target="navigation"]'),
        'state': document.querySelector('.navigation').dataset.state,
        'init':function(){
            Navigation.toggler.addEventListener('click', function() {
                Navigation.toggle();
            });
            var hitboxOffNav = document.querySelector('.navigation-close-hitbox');
            hitboxOffNav.addEventListener('click', function() {
                Navigation.close();
            });
            var navLinks = document.querySelectorAll(".navigation a");
            for(var i=0;i<navLinks.length;i++) {
                var link = navLinks[i];
                link.addEventListener('click', function() {
                    console.log('Closing Menu');
                    Navigation.close();
                });
            }
            var logout = document.querySelector('.logout');
            logout.addEventListener('click', function() {
                toggleSignIn();
            });

        },
        "updateNavigation":function(state){
            var navLinks = document.querySelectorAll('.navigation a');
            for(var i=0;i<navLinks.length;i++) {
                var link = navLinks[i];
                link.className = link.className.replace(new RegExp('(?:^|\\s)'+ 'hidden' + '(?:\\s|$)'), ' ');
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
            //console.log("Navigation:",navigationId);
            //console.log("Navigation status:",Navigation.state);
            if(Navigation.state == "false"){
                //console.log("Open Navigation");
                Navigation.open();
            } else {
                //console.log("Close Navigation");
                Navigation.close();
            }
        },
        'open':function(){
            Navigation.object.dataset.state = "true";
            Navigation.state = "true";
            Navigation.object.className += " active";
            Navigation.toggler.className += " active";
            document.querySelector('body').className += " navigation-open";
        },
        'close':function(){
            Navigation.object.dataset.state = "false";
            Navigation.state = "false";
            Navigation.object.className = Navigation.object.className.replace(new RegExp('(?:^|\\s)'+ 'active' + '(?:\\s|$)'), ' ');
            Navigation.toggler.className = Navigation.toggler.className.replace(new RegExp('(?:^|\\s)'+ 'active' + '(?:\\s|$)'), ' ');
            document.querySelector('body').className = document.querySelector('body').className.replace(new RegExp('(?:^|\\s)'+ 'navigation-open' + '(?:\\s|$)'), ' ');;
        }
    }


    App.init();
    Overlay.init();
    Navigation.init();
});