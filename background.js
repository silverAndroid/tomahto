var PREFS = prefs();

function prefs() {
    return {
        sites: [
            'facebook.com',
            'youtube.com',
            'twitter.com',
            'tumblr.com',
            'instagram.com',
            'reddit.com',
            'amazon.ca',
            'messenger.com'
        ],
        minTime: 1,
        maxTime: 4
    }
}

function init() {
    var queryInfo = {
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        closeTabs(getUnblockedTabs(tabs));
    });
}

function getUnblockedTabs(tabs) {
    return tabs.filter(function(tab) {
        return !isDomainBlocked(tab.url);
    });
}

function parseDomain(url) {
    return url.replace(/(https?:\/\/)?(www.)?/, '').split('.')[0];
}

function domainsMatch(test, against) {
    return parseDomain(test) === parseDomain(against);
}

function isChromeURL(url) {
    return url.startsWith('chrome://');
}

function isDomainBlocked(testSite) {
    return PREFS.sites.some(function (site) {
        return domainsMatch(site, testSite);
    }) || isChromeURL(testSite);
}

function closeTabs(tabs) {
    var p = Promise.resolve();
    tabs.forEach(function(tab, index) {
        p = p.then(function() {
            return closeTab(tab.id, index);
        });
    })    
}

function closeTab(tabID, index) {
    return new Promise(function(resolve) {
        setTimeout(chrome.tabs.remove, generateRandomTime(PREFS.minTime, PREFS.maxTime), tabID, function() {
            playAudio(index === 0 ? 'you_played_yourself.mp3' : 'another_one.mp3');
            resolve();
        });
    });
}

function generateRandomTime(min, max) {
    return (Math.random() * (max - min) + min) * 1000;
}

function playAudio(path) {
    var audio = new Audio();
    audio.src = path;
    audio.play();
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    // do your things
    init();
  }
});