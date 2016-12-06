/*
ApplicationDbContext
--------------------
1) Database transactions to the database --> localstorage
2) Cache
*/
var ApplicationDbContext = {
    "init": function(strConnection) {
        this._strConnection = strConnection; // Connection string to the key in the localstorage
        this._dbData = {
            "info": {
                "title": "Doekeewa",
                "description": "Doekeewa is an application to help people find and discover new places and activities in Ghent. This is an assignment for Artevelde University College Ghent.",
                "version": "1.0.",
                "modified": "2016-11-17",
                "author": "AHS - GDM - MMP"
            },
            "activeuser": null,
            "users": [],
            "tinderizedusers": [],
            "timetable": [],
            "settings": []
        }; // JSON-string: The data as value of the previous connection string (key in the localstorage)
        // Save the data in the localstorage. First check if the data is present in the database. If present -> GET THE DATA. If not --> SAVE _dbData in the database
        if(Utils.store(this._strConnection) != null) {
            this._dbData = Utils.store(this._strConnection);
        } else {
            Utils.store(this._strConnection, this._dbData);
        }
    },
    "getUsers": function() {
        // Get all users
        var users = this._dbData.users;
        if(users == null || (users != null && users.length == 0)) {
            return null;
        }
        return users;
    },
    "getActivites": function() {
        // Get all activites
        var activites = this._dbData.activites;
        if(activites == null || (activites != null && activites.length == 0)) {
            return null;
        }
        return activites;
    },
    "getUserById": function(id) {
        // Get user by id
        var index = this.findUserIndexById(id);
        if(index == -1) {
            return null;
        }
        return this._dbData.users[index];
    },
    "getUserByUserName": function(userName) {
        // Find the index of the user by id
        var users = this.getUsers();
        if(users == null) {
            return null;
        }
        return _.find(users, function(user) { return user.UserName == userName; });
    },
    "setActiveUser": function(user) {
        this._dbData.activeuser = user;
        this.save();
    },
    "addUser": function(user) {
        // Add a new user (CREATE -> DB INSERT)
        if(user != null && (user.Id == undefined || this.getUserById(user.Id) == null)) {
            user.Id = Utils.guid();
            user.CreatedAt = new Date().getTime();
            this._dbData.users.push(user);
            this.save();
            return user;
        }
        return null;
    },
    "updateUser": function(user) {
        // Update an existing user (UPDATE -> DB UPDATE)
        var index = this.findUserIndexById(user.Id);
        if(index == -1) {
            return false;
        }
        user.UpdatedAt = new Date().getTime();
        this._dbData.users[index] = user;
        this.save();
        return true;
    },
    "deleteUser": function(id) {
        // Delete an existing user (DELETE -> DB DELETE)
        var index = this.findUserIndexById(id);
        if(index == -1) {
            return false;
        }
        this._dbData.users.splice(index, 1);
        this.save();
        return true;
    },
    "softDeleteUser": function(id) {
        // Soft Delete an existing user (UPDATE -> DB UPDATE)
        // Field: DeletedAt = Snapshot in time
        var index = this.findUserIndexById(id);
        if(index == -1) {
            return false;
        }
        var user =  this._dbData.users[index];
        user.UpdatedAt = new Date().getTime();
        user.DeletedAt = new Date().getTime();
        this._dbData.users[index] = user;
        this.save();
        return true;
    },
    "softUndeleteUser": function(id) {
        // Soft UnDelete an existing user (UPDATE -> DB UPDATE)
        // Field: DeletedAt = null
        var index = this.findUserIndexById(id);
        if(index == -1) {
            return false;
        }
        var user =  this._dbData.users[index];
        user.UpdatedAt = new Date().getTime();
        user.DeletedAt = null;
        this._dbData.users[index] = user;
        this.save();
        return true;
    },
    "save": function() {
        // Save _dbData into the database (localstorage)
        Utils.store(this._strConnection, this._dbData);
        return true;
    },
    "findUserIndexById": function(id) {
        // Find the index of the user by id
        var users = this.getUsers();
        if(users == null) {
            return -1;
        }
        return _.findIndex(users, function(user) { return user.Id == id; });
    }
};

/*
UserManager
--------------------
1) Login, logout a User
2) Cache
*/
var UserManager = {
    "init": function(applicationDbContext) {
        this._applicationDbContext = applicationDbContext;
    },
    "login": function(userName, passWord) {
        var user = this._applicationDbContext.getUserByUserName(userName);
        if(user == null) {
            return null;
        }
        if(user.PassWord != passWord) {
            return false;
        }
        this._applicationDbContext.setActiveUser(user);
        return user;
    },
    "logout": function() {
        this._applicationDbContext.setActiveUser(null);
        return true;
    }
}
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