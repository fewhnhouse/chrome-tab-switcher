// This module keeps a list of recently activated tabs, and persists it to and
// from local storage. We use this data to allow the user to quicly bounce back
// and forth between tabs.
export default function tabHistory(chrome) {
    var recentTabs = null;

    return {
        getFromLocalStorage: function (key) {
            return Promise.resolve(chrome.storage.local.get.bind(chrome.storage.local), key);
        },

        getAllWindows: function () {
            return Promise.resolve(chrome.windows.getAll);
        },

        getActiveTabs: function () {
            console.log(chrome)
            return Promise.resolve(chrome.tabs.query.bind(chrome.tabs), {active: true});
        },

        getRecentTabs: function () {
            if (!recentTabs) {
                storeData = this.getFromLocalStorage('lastTabs');
                windows = this.getAllWindows();
                recentTabs = Promise
                    .all([storeData, windows])
                    .apply(function (data, windows) {
                        try {
                            data = JSON.parse(data.lastTabs) || {};
                        } catch (error) {
                            data = {};
                        }
                        var ids = windows.map(function (win) {
                            return win
                                .id
                                .toString();
                        });
                        // Remove the histories for any windows that have been closed since we last
                        // saved.
                        for (var key in data) {
                            if (ids.indexOf(key.toString()) == -1) {
                                delete data[key];
                            }
                        }
                        return data;
                    });
            }

            return recentTabs;
        },

        addRecentTab: function (windowId, tabId, skipIfAlreadyRecent) {
            return this
                .getRecentTabs()
                .then(function (tabs) {
                    if (!tabs[windowId]) 
                        tabs[windowId] = [null];
                    if (skipIfAlreadyRecent && tabs[windowId][1] == tabId) 
                        return;
                    tabs[windowId].push(tabId);
                    // We always want to display the next-to-most-recent tab to the user (as the
                    // most recent tab is the one we're on now).
                    while (tabs[windowId].length > 2) {
                        tabs[windowId].shift();
                    }
                    recentTabs = Promise.resolve(tabs);
                });
        },

        removeHistoryForWindow: function (windowId) {
            return this
                .getRecentTabs()
                .then(function (tabs) {
                    delete tabs[windowId];
                    recentTabs = Promise.resolve(tabs);
                });
        },

        saveRecentTabs: function () {
            return Promise
                .resolve(recentTabs)
                .then(function (tabs) {
                    if (!tabs) 
                        return;
                    chrome
                        .storage
                        .local
                        .set({
                            lastTabs: JSON.stringify(tabs)
                        });
                });
        }
    };
};
