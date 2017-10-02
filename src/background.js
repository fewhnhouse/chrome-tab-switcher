import tabHistory from './background/tab_history';
import windowManager from './background/window_manager';

var PADDING_TOP = 50;
var PADDING_BOTTOM = 50;
var SWITCHER_WIDTH = 600;

var history = tabHistory(chrome);
var manager = windowManager(chrome);
// Persist the tab history to local storage every minute.
setInterval(function () {
    history.saveRecentTabs();
}, 60 * 1000);

// Chrome will wake up the extension, if necessary, to call this listener.
chrome
    .tabs
    .onActivated
    .addListener(function (tab) {
        var windowId = tab.windowId;
        var tabId = tab.tabId;
        history.addRecentTab(windowId, tabId);
    });

// When the user closes a window, remove all that window's history.
chrome
    .windows
    .onRemoved
    .addListener(function (windowId) {
        history.removeHistoryForWindow(windowId);
    });

// Add the currently active tab for each window to the history if they're not
// already the most recent active tab.
history
    .getActiveTabs()
    .then(function (tabs) {
        for (var idx in tabs) {
            var tab = tabs[idx];
            var windowId = tab.windowId;
            var tabId = tab.id;
        }
        history.addRecentTab(windowId, tabId, true);
    });

chrome
    .commands
    .onCommand
    .addListener(function (command) {
        // Users can bind a key to this command in their Chrome keyboard shortcuts, at
        // the bottom of their extensions page.
        if (command === 'show-tab-switcher') {
            var currentWindow = manager.getCurrentWindow();
            var switcherWindowId = manager.getSwitcherWindowId();

            Promise
                .all([currentWindow, switcherWindowId])
                .then((val) => {
                    let currentWindow = val[0];
                    let switcherWindowId = val[1];
                    // Don't activate the switcher from an existing switcher window.
                    if (currentWindow.id == switcherWindowId) {
                        console.log("rip");
                        return;
                    }
                    // When the user activates the switcher and doesn't have "search in all windows"
                    // enabled, we need to know which was the last non-switcher window that was
                    // active.
                    manager.setLastWindowId(currentWindow.id);
                    var left = currentWindow.left + Math.round((currentWindow.width - SWITCHER_WIDTH) / 2);
                    var top = currentWindow.top + PADDING_TOP;
                    var height = Math.max(currentWindow.height - PADDING_TOP - PADDING_BOTTOM, 600);
                    var width = SWITCHER_WIDTH;

                    manager.showSwitcher(width, height, left, top);
                });
        }
    });

chrome
    .runtime
    .onMessage
    .addListener(function (request, sender, respond) {
        if (request.switchToTabId) {
            manager.switchToTab(request.switchToTabId);
        }

        if (request.sendTabData) {
            Promise.all([
                    history.getRecentTabs(),
                    manager.getLastWindowId()
                ])
                .then((val) => {
                    let recentTabs = val[0];
                    let getLastWindowId = val[1];
                    return manager.queryTabs(sender.tab.id, request.searchAllWindows, recentTabs, lastWindowId);
                })
                .then((val) => {
                    respond(val);
                });
            // We must return `true` so that Chrome leaves the messaging channel open, thus
            // allowing us to call `respond`.
            return true;
        }

        if (request.closeTabId) {
            manager.closeTab(request.closeTabId);
        }
    });
