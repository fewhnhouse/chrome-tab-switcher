export default function windowManager(chrome) {
    var switcherWindowId = Promise.resolve(null);
    var lastWindowId = Promise.resolve(null);

    return {
        getTabInfo: function (tabId) {
            return Promise.resolve(chrome.tabs.get, tabId);
        },

        getCurrentWindow: function () {
            return Promise.resolve(chrome.windows.getCurrent);
        },

        getSwitcherWindowId: function () {
            return switcherWindowId;
        },

        setSwitcherWindowId: function (id) {
            switcherWindowId = Promise.resolve(id);
            return switcherWindowId;
        },

        getLastWindowId: function () {
            return lastWindowId;
        },

        setLastWindowId: function (id) {
            lastWindowId = Promise.resolve(id);
            return lastWindowId;
        },

        showSwitcher: function (width, height, left, top) {
            var opts = {
                width: width,
                height: height,
                left: left,
                top: top,
                url: chrome
                    .runtime
                    .getURL('build/html/switcher.html'),
                focused: true,
                type: 'popup'
            };

            return Promise.resolve(chrome.windows.create.bind(chrome.windows), opts)
                .then(function (switcherWindow) {
                    this.setSwitcherWindowId(switcherWindow.id);
                }.bind(this));
        },

        queryTabs: function (senderTabId, searchAllWindows, recentTabs, lastWindowId) {
            var options = searchAllWindows
                ? {}
                : {
                    windowId: lastWindowId
                };
            return Promise
                .resolve(chrome.tabs.query, options)
                .then(function (tabs) {
                    tabs = tabs.filter(function (tab) {
                        return tab.id != senderTabId;
                    });
                    return {
                        tabs: tabs,
                        lastActive: (recentTabs[lastWindowId] || [])[0] || null
                    };
                });
        },

        switchToTab: function (tabId) {
            chrome
                .tabs
                .update(tabId, {active: true});
            return this
                .getTabInfo(tabId)
                .then(function (tab) {
                    if (tab) 
                        chrome.windows.update(tab.windowId, {focused: true});
                    }
                );
        },

        closeTab: function (tabId) {
            return Promise.resolve(chrome.tabs.remove, tabId);
        }
    };
};
