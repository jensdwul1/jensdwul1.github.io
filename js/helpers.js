Handlebars.registerHelper('fullName', function(user) {
   return user.FirstName + ' ' + user.SurName;
});
Handlebars.registerHelper('gender', function(gender) {
   return Genders.properties[gender].name;
});
Handlebars.registerHelper('age', function(strDayOfBirth) {
   return Utils.getAge(new Date(strDayOfBirth));
});
Handlebars.registerHelper('toLowerCase', function(str) {
   return str.toLowerCase();
});
Handlebars.registerHelper('toShortDateString', function(dob) {
   return new Date(dob * 1000).toShortDateString();
});
Handlebars.registerHelper('address', function(location) {
   return location.street + ', ' + location.zip + ' ' + location.city
})
Handlebars.registerHelper('timeToTwitterDateTimeString', function(time) {
   return Utils.timeToTwitterDateTimeString(time)
});
Handlebars.registerHelper('geoReadable', function(lat, lng){
    return '(' + parseFloat(lat).toFixed(5) + ', ' + parseFloat(lng).toFixed(5) + ')';
});
Handlebars.registerHelper('geoDistance', function(place, geoLocation){
    var distance = Utils.calculateDistanceBetweenTwoCoordinates(place.lat, place.long, geoLocation.coords.latitude, geoLocation.coords.longitude);

    if(distance > 1){
        distance = distance.toFixed(3) + ' km';
    }else{
        distance = (distance*1000).toFixed(0) + ' m';
    }
    return distance;
});
Handlebars.registerHelper('usageYear', function(year) {
    return (year > 1970)?' (Ingebruikname: ' + year + ')':'';
});
Handlebars.registerHelper('getReadableGeoDistance', function(distance) {
    if(distance > 1) {
        distance = distance.toFixed(3) + ' km';
    } else {
        distance = (distance*1000).toFixed(0) + ' m';
    }
    return distance;
});

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};

$(function() {

    toastr.options.positionClass = 'toast-bottom-full-width';
    toastr.options.extendedTimeOut = 0; //1000;
    toastr.options.timeOut = 5000;
    toastr.options.fadeOut = 250;
    toastr.options.fadeIn = 250;
});

function prepErrors(messages){
    var errorMessage = "";
    for(var i=0;i<messages.length;++i) {
        var message = messages[i];
        errorMessage += i+1 +". "+message;
        if(i +1 !== messages.length){
            errorMessage += "<br>";
        }
    }
    return errorMessage;
}
function popToast(type,message){
    //toastr.error('1. Ducks <br> 2. Tricks', 'You have some errors!')

}
