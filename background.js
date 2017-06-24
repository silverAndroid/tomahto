var PREFS = prefs();

function prefs() {
    return {
        sites: [
            'facebook.com',
            'youtube.com',
            'twitter.com',
            'tumblr.com',
            'pinterest.com',
            'myspace.com',
            'livejournal.com',
            'digg.com',
            'stumbleupon.com',
            'reddit.com',
            'kongregate.com',
            'newgrounds.com',
            'addictinggames.com',
            'hulu.com'
        ]
    }
}

function parseDomain(url) {
    return url.replace(/(https?:\/\/)?(www.)?/, '').split('.')[0];
}

function domainsMatch(test, against) {
    return parseDomain(test) === parseDomain(against);
}

function isDomainBlocked(testSite) {
    return PREFS.sites.some(function(site) {
        return domainsMatch(site, testSite);
    });
}