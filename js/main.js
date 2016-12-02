function ready(cb) {
    /in/.test(document.readyState)
    ? setTimeout(ready.bind(null, cb), 90)
    : cb();
};

ready(function(){

    var App = {
        "init": function() {
            this._unitTesting = false; // Unit Testing the features in ApplicationDbContext or not
            this._widthHandlebarsAndLoDash = true; // Use Handlebars Template Engine And LoDash or Not

            this.URLRANDOMUSERME = 'http://api.randomuser.me/?results=500&callback=json_callback';// Cache the url with random users in variable URLRANDOMUSERME

            this._applicationDbContext = ApplicationDbContext; // Reference to the ApplicationDbContext object
            this._applicationDbContext.init('ahs.gdm.mmp.lecturerama'); // Initialize the ApplicationDbContext object via the methode init. Do not forget the connection string as a parametervalue of this function
            this._userManager = UserManager; // Reference to the UserManager object
            this._userManager.init(this._applicationDbContext);// Initialize the UserManager object via the methode init. Do not forget the reference to the this._applicationDbContext variable as a parametervalue of this function

            this._frmLogin = document.querySelector('#frm-login'); // Cache Form Login
            this.registerEventListeners(); // Register the Event Listeners for all present elements

			this._hbsCache = {};// Handlebars cache for templates
			this._hbsPartialsCache = {};// Handlebars cache for partials

            this._activeUser = null; // Active User


            if(this._unitTesting || this._applicationDbContext.getLecturers() == null) {
                this.unitTests();
            }
        },
        "registerEventListeners": function() {

            // Event Listeners for Form Login
            if(this._frmLogin != null) {
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmLogin.addEventListener('submit', function(ev) {
                    ev.preventDefault();

                    var userName = Utils.trim(this.querySelectorAll('[name="txtUserName"]')[0].value);
                    var passWord = Utils.trim(this.querySelectorAll('[name="txtPassWord"]')[0].value);
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
                this.updateUILecturers('list-lecturers', '#template-list-lecturers');
            } else {
                this.updateUIOldSchoolLecturers();
            }
            */
        },
        "updateUIOldSchoolLecturers": function() {
            if(this._applicationDbContext.getTinderizeLecturersByUserId(this._activeUser.Id) != null) {
                var tempStr = '';
                var ch = window.innerHeight - 110;
                
                var lecturers = this._applicationDbContext.getTinderizeLecturersByUserId(this._activeUser.Id), lecturer = null;
                for(var i=0;i<lecturers.length;i++) {
                    var lecturer = lecturers[i];
                    tempStr += '<div class="lecturer" data-id="' + lecturer.Id + '">';
                    tempStr += '<div class="lecturer__meta">' + '<span class="lecturer__gender">' + Genders.properties[lecturer.Gender].name + '</span>' + '<span class="lecturer__age">' + Utils.getAge(new Date(lecturer.DayOfBirth)) + '</span>' + '</div>';
                    tempStr += '<picture class="lecturer__picture">';
                    tempStr += '<img src="' + lecturer.Picture + '" />';
                    tempStr += '</picture>';
                    tempStr += '<h3 class="lecturer__name">' + lecturer.FirstName + ' ' + lecturer.SurName + '</h3>';
                    tempStr += '<div class="lecturer__actions">';
                    tempStr += '<span class="material-icons like" data-id="' + lecturer.Id + '" data-tinderize="1">&#xE87D;</span>';
                    tempStr += '<span class="material-icons dislike" data-id="' + lecturer.Id + '" data-tinderize="2">&#xE043;</span>';
                    tempStr += '</div>';
                    tempStr += '</div>';
                };

                document.querySelector('.list-lecturers-content').innerHTML = tempStr;
                
                this.registerLecturerEventListeners(); // Register EventListeners for all like and dislike buttons
            }
        },
        "updateUILecturers": function(hbsTmplName, hbsTmplId) {
            if(!this._hbsCache[hbsTmplName]) {
				var src = document.querySelector(hbsTmplId).innerHTML;// Get the contents from the specified hbs template
				this._hbsCache[hbsTmplName] = Handlebars.compile(src);// Compile the source and add it to the hbs cache
			}	
			document.querySelector('.list-lecturers-content').innerHTML = this._hbsCache[hbsTmplName](this._applicationDbContext.getTinderizeLecturersByUserId(this._activeUser.Id));// Write compiled content to the appropriate container

            this.registerLecturerEventListeners(); // Register EventListeners for all like and dislike buttons
        },
        "registerLecturerEventListeners": function() {
            var self = this;

            var lecturerElements = document.querySelectorAll('.lecturer');
            if(lecturerElements != null && lecturerElements.length > 0) {
                var lecturerElement = null;
                for(var i=0;i<lecturerElements.length;i++) {
                    lecturerElement = lecturerElements[i];
                    lecturerElement.querySelector('.like').addEventListener('click', function(ev) {
                        self.addTinderizeLecturer(this.dataset.id, this.dataset.tinderize);
                    });
                    lecturerElement.querySelector('.dislike').addEventListener('click', function(ev) {
                        self.addTinderizeLecturer(this.dataset.id, this.dataset.tinderize);
                    });
                }
            }
        },
        "addTinderizeLecturer": function(lecturerId, tinderize) {
            var tinderizeLecturer = new TinderizeLecturer();
            tinderizeLecturer.UserId = this._activeUser.Id;
            tinderizeLecturer.LecturerId = lecturerId;
            tinderizeLecturer.Tinderize = tinderize;
            var tinderizeLecturerAdded = this._applicationDbContext.addTinderizeLecturer(tinderizeLecturer);

            if(tinderizeLecturerAdded != null) {
                var lecturerElement = document.querySelector(`.lecturer[data-id="${lecturerId}"]`);

                if(lecturerElement != null) {
                    lecturerElement.parentElement.removeChild(lecturerElement);
                }
            }
        },
        "unitTests": function() {

            var self = this; // Closure
        /*
            //Unit Testing the Lecturers
            if(this._applicationDbContext.getLecturers() == null) {

                // Load JSON from corresponding RandomUserMe API with certain URL
                Utils.getJSONPByPromise(this.URLRANDOMUSERME).then(
                    function(data) {
                        var users = data.results, lecturer = null, user = null;
                        for(var i=0;i<users.length;i++) {
                            user = users[i];
                            lecturer = new Lecturer();
                            lecturer.FirstName = user.name.first;
                            lecturer.SurName = user.name.last;
                            lecturer.DayOfBirth = new Date(user.dob);
                            lecturer.UserName = user.login.username;
                            lecturer.PassWord = user.login.password;
                            lecturer.Email = user.email;
                            lecturer.Picture = user.picture.large;
                            switch(user.gender) {
                                case 'male': lecturer.Gender = Genders.MALE;break;
                                case 'female': lecturer.Gender = Genders.FEMALE;break;
                                default: lecturer.Gender = Genders.NOTKNOWN;break;
                            }
                            var lecturerAdded = self._applicationDbContext.addLecturer(lecturer);
                        }
                    },
                    function(status) {
                        console.log(status);
                    }
                );

            } else {
                // Update a lecturer
                var id = this._applicationDbContext.getLecturers()[0].Id;
                var lecturer = this._applicationDbContext.getLecturerById(id);
                if(lecturer != null) {
                    lecturer.FirstName = 'Olivia';
                    var result = this._applicationDbContext.updateLecturer(lecturer);
                    console.log(result);
                }

                // Soft delete or undelete a lecturer
                lecturer = this._applicationDbContext.getLecturerById(id);
                if(lecturer != null) {
                    var result = (lecturer.DeletedAt == null || lecturer.DeletedAt == undefined)?this._applicationDbContext.softDeleteLecturer(lecturer.Id):this._applicationDbContext.softUnDeleteLecturer(lecturer.Id);
                    console.log(result);
                }

                // Delete a lecturer
                lecturer = this._applicationDbContext.getLecturerById(id);
                if(lecturer != null) {
                    var result = this._applicationDbContext.deleteLecturer(lecturer.Id)
                    console.log(result);
                }
            }
        */
        }
    };

    App.init();
    
});