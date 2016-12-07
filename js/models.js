/*
Model: User
*/
function User() {
    this.Id;
    this.FirstName;
    this.SurName;
    this.DayOfBirth;

    this.DisplayName;
    this.PassWord;
    this.Email;
    this.Score;
    this.Activities;
    this.CreatedAt;
    this.UpdatedAt;
    this.DeletedAt;
}
function UserDoesActivities(){
    this.UserId;
    this.ActivityId;
    this.CreatedAt;
    this.Completed;
}

function Activity() {
    this.Id;
    this.Name;
    this.Score;
    this.Location;
    this.ActivityType;
    this.Users;
    this.CreatedAt;
    this.UpdatedAt;
    this.DeletedAt;
}
function ActivityType(){
    this.Id;
    this.Name;
    this.Weight;
    this.Image;
}
function Location(){
    this.Id;
    this.Name;
    this.Street;
    this.Streetnumber;
    this.City;
    this.Country;
    this.Address; //Save Formatted string here
    this.Latitude;
    this.Longitude;
}
