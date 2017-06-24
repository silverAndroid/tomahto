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
  shouldRingEl = document.getElementById('should-ring'), //checkbox
  saveSuccessfulEl = document.getElementById('save-successful'), // text next to submit button
  timeFormatErrorEl = document.getElementById('time-format-error'), // prolly nother thing
  background = chrome.extension.getBackgroundPage(), // the chrome window with ALL the tabs
  startCallbacks = {}, durationEls = {};

durationEls['min'] = document.getElementById('min-duration'); //we only need one of these two
durationEls['max'] = document.getElementById('max-duration');

var TIME_REGEX = /^([0-9]+)(:([0-9]{2}))?$/;

form.onsubmit = function () {
  console.log("form submitted");
  var durations = {}, duration, durationStr, durationMatch;
  
  // if (minDurationMatch && maxDurationMatch && minTime <= maxTime) 
  // {
  //   console.log(durationMatch);
  //   durations[key] = (60 * parseInt(durationMatch[1], 10));
  //   if(durationMatch[3]) {
  //      durations[key] += parseInt(durationMatch[3], 10);
  //   }
  // } else {
  //   timeFormatErrorEl.className = 'show';
  //   return false;
  //  } 

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
  if (parseInt(durations["max"]) < parseInt(durations["min"])) 
  {
    timeFormatErrorEl.className = 'show';
      return false;
  }
  
  console.log(durations);
  
  background.setPrefs({
    siteList:           siteListEl.value.split(/\r?\n/),
    durations:          durations,
    shouldRing:         shouldRingEl.checked,
    whitelist:          whitelistEl.selectedIndex == 1
  })
  saveSuccessfulEl.className = 'show';
  return false;
}

siteListEl.onfocus = formAltered;
shouldRingEl.onchange = formAltered;
whitelistEl.onchange = formAltered;

function formAltered() {
  saveSuccessfulEl.removeAttribute('class');
  timeFormatErrorEl.removeAttribute('class');
}

siteListEl.value = background.PREFS.siteList.join("\n");
shouldRingEl.checked = background.PREFS.shouldRing;
whitelistEl.selectedIndex = background.PREFS.whitelist ? 1 : 0;

var duration, minutes, seconds;
for(var key in durationEls) {
  duration = background.PREFS.durations[key];
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

if(background.mainPomodoro.mostRecentMode == 'min') {
  startCallbacks.min();
}