import tabHistory from './background/tab_history';
import windowManager from './background/window_manager';

const PADDING_TOP = 50;
const PADDING_BOTTOM = 50;
const SWITCHER_WIDTH = 600;

const history = tabHistory(chrome);
const manager = windowManager(chrome);
// Persist the tab history to local storage every minute.
setInterval(() => {
    history.saveRecentTabs();
}, 60 * 1000);

// Chrome will wake up the extension, if necessary, to call this listener.
chrome
    .tabs
    .onActivated
    .addListener((tab) => {
        let windowId = tab.windowId;
        let tabId = tab.tabId;
        history.addRecentTab(windowId, tabId);
    });

// When the user closes a window, remove all that window's history.
chrome
    .windows
    .onRemoved
    .addListener((windowId) => {
        history.removeHistoryForWindow(windowId);
    });

// Add the currently active tab for each window to the history if they're not
// already the most recent active tab.
history
    .getActiveTabs()
    .then((tabs)=> {
        tabs.forEach((tab) => {
            let windowId = tab.windowId;
            let tabId = tab.id;
        });
        history.addRecentTab(windowId, tabId, true);
    });

chrome
    .commands
    .onCommand
    .addListener((command) => {
        // Users can bind a key to this command in their Chrome keyboard shortcuts, at
        // the bottom of their extensions page.
        if (command === 'show-tab-switcher') {
            const currentWindow = manager.getCurrentWindow();
            const switcherWindowId = manager.getSwitcherWindowId();

            Promise
                .all([currentWindow, switcherWindowId])
                .then((val) => {
                    let currentWindow = val[0];
                    let switcherWindowId = val[1];
                    // Don't activate the switcher from an existing switcher window.
                    if (currentWindow.id === switcherWindowId) {
                        console.log("rip");
                        return;
                    }
                    // When the user activates the switcher and doesn't have "search in all windows"
                    // enabled, we need to know which was the last non-switcher window that was
                    // active.
                    manager.setLastWindowId(currentWindow.id);
                    let left = currentWindow.left + Math.round((currentWindow.width - SWITCHER_WIDTH) / 2);
                    let top = currentWindow.top + PADDING_TOP;
                    let height = Math.max(currentWindow.height - PADDING_TOP - PADDING_BOTTOM, 600);
                    let width = SWITCHER_WIDTH;

                    manager.showSwitcher(width, height, left, top);
                });
        }
    });

chrome
    .runtime
    .onMessage
    .addListener((request, sender, respond) => {
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
                    let lastWindowId = val[1];
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
