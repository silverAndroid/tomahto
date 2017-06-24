/*
  Localization
*/

// Localize all elements with a data-i18n="message_name" attribute
var localizedElements = document.querySelectorAll('[data-i18n]'), el, message;
for(var i = 0; i < localizedElements.length; i++) {
  el = localizedElements[i];
  message = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
  
  // Capitalize first letter if element has attribute data-i18n-caps
  if(el.hasAttribute('data-i18n-caps')) {
    message = message.charAt(0).toUpperCase() + message.substr(1);
  }
  
  el.innerHTML = message;
}

/*
  Form interaction
*/

var form = document.getElementById('options-form'),
  siteListEl = document.getElementById('site-list'), //list of sites in text area
  whitelistEl = document.getElementById('blacklist-or-whitelist'), //the picker of "block" or "allow"
  saveSuccessfulEl = document.getElementById('save-successful'), // text next to submit button
  timeFormatErrorEl = document.getElementById('time-format-error'), // prolly nother thing
  muteAudioEl = document.getElementById('should-ring'),
  timeIntervalErrorEl = document.getElementById('time-interval-error'), // prolly nother thing
  background = chrome.extension.getBackgroundPage(), // the chrome window with ALL the tabs
  startCallbacks = {}, durationEls = {};

durationEls['minTime'] = document.getElementById('min-duration'); //we only need one of these two
durationEls['maxTime'] = document.getElementById('max-duration');

var TIME_REGEX = /^([0-9]+)(:([0-9]{2}))?$/;

form.onsubmit = function () {
  console.log("form submitted");
  var durations = {}, duration, durationStr, durationMatch;

  for(var key in durationEls) {
    durationStr = durationEls[key].value;
    durationMatch = durationStr.match(TIME_REGEX);
    if(durationMatch) { //if proper format of time
      console.log(durationMatch);
      durations[key] = (60 * parseInt(durationMatch[1], 10));
      console.log(durations.toString());
      if(durationMatch[3]) {
        durations[key] += parseInt(durationMatch[3], 10);
      }
    } else {
      timeFormatErrorEl.className = 'show';
      return false;
    } 
  }

  // console.log(durations.toString());
  if (parseInt(durations["maxTime"]) < parseInt(durations["minTime"])) 
  {
    timeIntervalErrorEl.className = 'show';
    // timeFormatErrorEl.className = 'show';
      return false;
  }
  
  console.log(durations);
  
  background.setPrefs({
    sites:           siteListEl.value.split(/\r?\n/),
    minTime:         durations["minTime"],
    maxTime:         durations["maxTime"]
  })
  saveSuccessfulEl.className = 'show';
  return false;
}

siteListEl.onfocus = formAltered;
whitelistEl.onchange = formAltered;

function formAltered() {
  saveSuccessfulEl.removeAttribute('class');
  timeFormatErrorEl.removeAttribute('class');
  timeIntervalErrorEl.removeAttribute('class');
}

siteListEl.value = background.PREFS.sites.join("\n");
whitelistEl.selectedIndex = background.PREFS.whitelist ? 1 : 0;

var duration, minutes, seconds;
for(var key in durationEls) {
  duration = background.PREFS[key];
  seconds = duration % 60;
  minutes = (duration - seconds) / 60;
  if(seconds >= 10) {
    durationEls[key].value = minutes + ":" + seconds;
  } else if(seconds > 0) {
    durationEls[key].value = minutes + ":0" + seconds;
  } else {
    durationEls[key].value = minutes;
  }
  durationEls[key].onfocus = formAltered;
}

function setInputDisabled(state) {
  siteListEl.disabled = state;
  whitelistEl.disabled = state;
  for(var key in durationEls) {
    durationEls[key].disabled = state;
  }
}

startCallbacks.min = function () {
  document.body.className = 'min';
  setInputDisabled(true);
}

startCallbacks.max = function () {
  document.body.removeAttribute('class');
  setInputDisabled(false);
}

muteAudioEl.onchange = function() {
  if (this.checked) {
    background.playAudio('you_played_yourself.mp3');
  }
}

// if(background.mainPomodoro.mostRecentMode == 'min') {
//   startCallbacks.min();
// }