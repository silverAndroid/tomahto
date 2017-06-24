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
            'amazon.ca'
        ]
    }
}

function init() {
    var queryInfo = {
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        // console.log(getUnblockedTabs(tabs));
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
    tabs.forEach(function(tab) {
        closeTab(tab.id);
    })    
}

function closeTab(tabID) {
    chrome.tabs.remove(tabID, function () {
        console.log('Kyle\'s dum');
    });
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    // do your things
    init();
  }
});