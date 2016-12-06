/*
Model: User
*/
function User() {
    this.Id;
    this.FirstName;
    this.SurName;
    this.DayOfBirth;
    this.Gender;

    this.UserName;
    this.PassWord;
    this.Email;

    this.CreatedAt;
    this.UpdatedAt;
    this.DeletedAt;
}
function Activity() {
    this.Id;
    this.Name;
    this.Longitude;
    this.Latitude;
    this.ActivityType;
    this.CreatedAt;
    this.UpdatedAt;
    this.DeletedAt;
}

/*
Model: Genders
Simulation of enumeration in JavaScript
0 = not known,
1 = male,
2 = female,
9 = not applicable.
*/
var Genders = {
    NOTKNOWN: 0,
    MALE: 1,
    FEMALE: 2,
    NOTAPPLICABLE: 9,
    properties: {
        0: {id:0, name:'Not known'},
        1: {id:1, name:'Male'},
        2: {id:2, name:'Female'},
        9: {id:9, name:'Not applicable'}
    }
};

/*
Model: Tinderizes
Simulation of enumeration in JavaScript
0 = not known,
1 = male,
2 = female,
9 = not applicable.
*/
var Tinderizes = {
    NEUTRAL: 0,
    LIKE: 1,
    DISLIKE: 2,
    properties: {
        0: {id:0, name:'Neutral'},
        1: {id:1, name:'Like'},
        2: {id:2, name:'Dislike'}
    }
};

/*
Model: Genders
Simulation of enumeration in JavaScript
0 = not known,
1 = male,
2 = female,
9 = not applicable.
*/
function TinderizeUser() {
    this.UserId;
    this.UserId;
    this.Tinderize;

    this.CreatedAt;
    this.UpdatedAt;
    this.DeletedAt;
};
