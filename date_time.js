const monthNamesEt = [
  "jaanuar",
  "veebruar",
  "märts",
  "aprill",
  "mai",
  "juuni",
  "juuli",
  "august",
  "september",
  "oktoober",
  "november",
  "detsember",
];
const weekDays = [
  "pühapäev",
  "esmaspäev",
  "teisipäev",
  "kolmapäev",
  "neljapäev",
  "reede",
  "laupäev",
];
const dateEt = function () {
    let timeNow = new Date();
    let dateNow = timeNow.getDate();
    let monthNow = timeNow.getMonth();
    let yearNow = timeNow.getFullYear();
   
    let dateNowEt = dateNow + "." + monthNamesEt[monthNow] + " " + yearNow;
    return dateNowEt;
};
const dayEt = function dayEt() {
  let timeNow = new Date();
  let dayNow = timeNow.getDay();
  let dayNowEt = weekDays[dayNow];
  return dayNowEt;
}
const timeEt = function timeEt() {
  function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  let timenow = new Date();
  let hoursNow = addZero(timenow.getHours());
  let minutesNow = addZero(timenow.getMinutes());
  let secondsNow = addZero(timenow.getSeconds());
  let timeNow = hoursNow + ":" + minutesNow + ":" + secondsNow;
  return timeNow;
}
const greetingEt = function greetingNow() {
  let timeNow = new Date();
  let hoursNow = timeNow.getHours();
  if (hoursNow < 12 && hoursNow >= 7) {
    greeting = "Hommik!";
  } else if (hoursNow >= 12 && hoursNow < 18) {
    greeting = "Tere päevast!";
  } else if (hoursNow >= 0 && hoursNow < 7) {
    greeting = "öö on, miks ei maga?";
  } else {
    greeting = "Tere õhtust!";
  }
  return greeting;
}
const dayPlanEt = function dayPlanToday() {
  let timeNow = new Date();
  let hoursNow = timeNow.getHours();
  let dayNowEt = timeNow.getDay();
  if (dayNowEt == 1 || dayNowEt == 2 || dayNowEt == 3 || dayNowEt == 4 || dayNowEt == 5 || dayNowEt == 6 ) {
    if ( hoursNow >= 8 && hoursNow < 16 ){
      plan = "Praegu on koolipäev!"
    }
    else if ( hoursNow >= 16 && hoursNow < 21 ){
      plan = "Praegu on õppimise ja puhkamise aeg! Kasuta aega otstarbekalt ja tee enda asjad ära!"
    }
    else if ( hoursNow >= 21 || hoursNow >= 0 && hoursnow <6 ){
      plan = "Magamise aeg! Miks üleval oled?"
    }
    else if ( hoursNow >= 6 && hoursNow < 8) {
      plan = "Äratus!"
    }
  }
  else if (dayNowEt == 7){
    plan ="Täna on laupäev. On aeg sõpradega aega veeta ja teha kodutöid, kui pole tööpäeva :( "
  }
  else if (dayNowET == 0) {
    plan = "Täna on pühapäev, võta rahulikult ja puhka!";
  }
  return plan;
}
module.exports = {monthNamesEt, dateEt, dayEt, weekDays, timeEt, greetingEt, dayPlanEt }