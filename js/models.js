/*
Model: User
*/
function User() {
    this.Id;
    this.FirstName;
    this.SurName;
    this.DayOfBirth;

    this.UserName;
    this.PassWord;
    this.Email;
    this.Score;

    this.CreatedAt;
    this.UpdatedAt;
    this.DeletedAt;
}
function Activity() {
    this.Id;
    this.Name;
    this.Longitude;
    this.Latitude;
    this.Score;
    this.ActivityType;
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
