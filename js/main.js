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

            this.URLRANDOMUSERME = 'http://api.randomuser.me/?results=500&callback=json_callback';// Cache the url with random users in variable URLRANDOMUSERME

            this._applicationDbContext = ApplicationDbContext; // Reference to the ApplicationDbContext object
            this._applicationDbContext.init('ahs.gdm.mmp.doekeewa'); // Initialize the ApplicationDbContext object via the methode init. Do not forget the connection string as a parametervalue of this function
            this._userManager = UserManager; // Reference to the UserManager object
            this._userManager.init(this._applicationDbContext);// Initialize the UserManager object via the methode init. Do not forget the reference to the this._applicationDbContext variable as a parametervalue of this function

            this._frmLogin = document.querySelector('#frm-login'); // Cache Form Login
            this.registerEventListeners(); // Register the Event Listeners for all present elements

			this._hbsCache = {};// Handlebars cache for templates
			this._hbsPartialsCache = {};// Handlebars cache for partials

            this._activeUser = null; // Active User


            if(this._unitTesting || this._applicationDbContext.getUsers() == null) {
                this.unitTests();
            }


        },

        "registerEventListeners": function() {

            // Event Listeners for Form Login
            if(this._frmLogin != null) {
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmLogin.addEventListener('submit', function(ev) {
                    ev.preventDefault();

                    var userName = Utils.trim(this.querySelectorAll('[name="username"]')[0].value);
                    var passWord = Utils.trim(this.querySelectorAll('[name="password"]')[0].value);
                    var result = self._userManager.login(userName, passWord);
                    if(result == null) {

                    } else if(result == false) {

                    } else {
                        self._activeUser = result; // User is Logged in
                        self.updateUI();
                    }
                    
                    return false;
                });
            }


        },
        "updateUI": function() {
            /*
            if( this._widthHandlebarsAndLoDash) {
                this.updateUIUsers('list-users', '#template-list-users');
            } else {
                this.updateUIOldSchoolUsers();
            }
            */
        },
        "updateUIOldSchoolUsers": function() {
            if(this._applicationDbContext.getTinderizeUsersByUserId(this._activeUser.Id) != null) {
                var tempStr = '';
                var ch = window.innerHeight - 110;
                
                var users = this._applicationDbContext.getTinderizeUsersByUserId(this._activeUser.Id), user = null;
                for(var i=0;i<users.length;i++) {
                    var user = users[i];
                    tempStr += '<div class="user" data-id="' + user.Id + '">';
                    tempStr += '<div class="user__meta">' + '<span class="user__gender">' + Genders.properties[user.Gender].name + '</span>' + '<span class="user__age">' + Utils.getAge(new Date(user.DayOfBirth)) + '</span>' + '</div>';
                    tempStr += '<picture class="user__picture">';
                    tempStr += '<img src="' + user.Picture + '" />';
                    tempStr += '</picture>';
                    tempStr += '<h3 class="user__name">' + user.FirstName + ' ' + user.SurName + '</h3>';
                    tempStr += '<div class="user__actions">';
                    tempStr += '<span class="material-icons like" data-id="' + user.Id + '" data-tinderize="1">&#xE87D;</span>';
                    tempStr += '<span class="material-icons dislike" data-id="' + user.Id + '" data-tinderize="2">&#xE043;</span>';
                    tempStr += '</div>';
                    tempStr += '</div>';
                };

                document.querySelector('.list-users-content').innerHTML = tempStr;
                
                this.registerUserEventListeners(); // Register EventListeners for all like and dislike buttons
            }
        },
        "updateUIUsers": function(hbsTmplName, hbsTmplId) {
            if(!this._hbsCache[hbsTmplName]) {
				var src = document.querySelector(hbsTmplId).innerHTML;// Get the contents from the specified hbs template
				this._hbsCache[hbsTmplName] = Handlebars.compile(src);// Compile the source and add it to the hbs cache
			}	
			document.querySelector('.list-users-content').innerHTML = this._hbsCache[hbsTmplName](this._applicationDbContext.getTinderizeUsersByUserId(this._activeUser.Id));// Write compiled content to the appropriate container

            this.registerUserEventListeners(); // Register EventListeners for all like and dislike buttons
        },
        "registerUserEventListeners": function() {
            var self = this;

            var userElements = document.querySelectorAll('.user');
            if(userElements != null && userElements.length > 0) {
                var userElement = null;
                for(var i=0;i<userElements.length;i++) {
                    userElement = userElements[i];
                    /*
                    userElement.querySelector('.like').addEventListener('click', function(ev) {
                        self.addTinderizeUser(this.dataset.id, this.dataset.tinderize);
                    });
                    userElement.querySelector('.dislike').addEventListener('click', function(ev) {
                        self.addTinderizeUser(this.dataset.id, this.dataset.tinderize);
                    });
                    */
                }
            }
        },
        "unitTests": function() {

            var self = this; // Closure
        /*
            //Unit Testing the Users
            if(this._applicationDbContext.getUsers() == null) {

                // Load JSON from corresponding RandomUserMe API with certain URL
                Utils.getJSONPByPromise(this.URLRANDOMUSERME).then(
                    function(data) {
                        var users = data.results, user = null, user = null;
                        for(var i=0;i<users.length;i++) {
                            user = users[i];
                            user = new User();
                            user.FirstName = user.name.first;
                            user.SurName = user.name.last;
                            user.DayOfBirth = new Date(user.dob);
                            user.UserName = user.login.username;
                            user.PassWord = user.login.password;
                            user.Email = user.email;
                            user.Picture = user.picture.large;
                            switch(user.gender) {
                                case 'male': user.Gender = Genders.MALE;break;
                                case 'female': user.Gender = Genders.FEMALE;break;
                                default: user.Gender = Genders.NOTKNOWN;break;
                            }
                            var userAdded = self._applicationDbContext.addUser(user);
                        }
                    },
                    function(status) {
                        console.log(status);
                    }
                );

            } else {
                // Update a user
                var id = this._applicationDbContext.getUsers()[0].Id;
                var user = this._applicationDbContext.getUserById(id);
                if(user != null) {
                    user.FirstName = 'Olivia';
                    var result = this._applicationDbContext.updateUser(user);
                    console.log(result);
                }

                // Soft delete or undelete a user
                user = this._applicationDbContext.getUserById(id);
                if(user != null) {
                    var result = (user.DeletedAt == null || user.DeletedAt == undefined)?this._applicationDbContext.softDeleteUser(user.Id):this._applicationDbContext.softUnDeleteUser(user.Id);
                    console.log(result);
                }

                // Delete a user
                user = this._applicationDbContext.getUserById(id);
                if(user != null) {
                    var result = this._applicationDbContext.deleteUser(user.Id)
                    console.log(result);
                }
            }
        */
        }
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
                    var overlayId = overlay.dataset.id;
                    var button = document.querySelector('button[data-target="'+overlayId+'"]');
                    button.addEventListener('click', function() {
                        var self = this;
                        //console.log("Target",self.dataset.target);
                        Overlay.toggle(self.dataset.target,"close");
                    });

                    /*
                     General linking behaviour is here > Should be moved to the general App Init when that is finished
                     */

                    var links = document.querySelectorAll(".overlay-link[data-target]");
                    for(var i=0;i<links.length;i++) {
                        var link = links[i];
                        link.addEventListener('click', function() {
                            var self = this;
                            //console.log("Target: ",self.dataset.target);
                            Overlay.toggle(self.dataset.target);
                        });
                    }
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

            var navLinks = document.querySelectorAll(".navigation a");
            for(var i=0;i<navLinks.length;i++) {
                var link = navLinks[i];
                link.addEventListener('click', function() {
                    console.log('Closing Menu');
                    Navigation.close();
                });
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