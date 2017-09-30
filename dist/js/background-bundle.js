/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 33);
/******/ })
/************************************************************************/
/******/ ({

/***/ 33:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _tab_history = __webpack_require__(34);

var _tab_history2 = _interopRequireDefault(_tab_history);

var _window_manager = __webpack_require__(35);

var _window_manager2 = _interopRequireDefault(_window_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PADDING_TOP = 50;
var PADDING_BOTTOM = 50;
var SWITCHER_WIDTH = 600;

var history = (0, _tab_history2.default)(chrome);
var manager = (0, _window_manager2.default)(chrome);
console.log(history, manager);
// Persist the tab history to local storage every minute.
setInterval(function () {
    console.log("Background Tab");
    history.saveRecentTabs();
}, 60 * 1000);

// Chrome will wake up the extension, if necessary, to call this listener.
chrome.tabs.onActivated.addListener(function (tab) {
    var windowId = tab.windowId;
    var tabId = tab.tabId;
    history.addRecentTab(windowId, tabId);
});

// When the user closes a window, remove all that window's history.
chrome.windows.onRemoved.addListener(function (windowId) {
    history.removeHistoryForWindow(windowId);
});

// Add the currently active tab for each window to the history if they're not
// already the most recent active tab.
history.getActiveTabs().then(function (tabs) {
    for (var idx in tabs) {
        var tab = tabs[idx];
        var windowId = tab.windowId;
        var tabId = tab.id;
    }
    history.addRecentTab(windowId, tabId, true);
});

chrome.commands.onCommand.addListener(function (command) {
    // Users can bind a key to this command in their Chrome keyboard shortcuts, at
    // the bottom of their extensions page.
    if (command == 'show-tab-switcher') {
        var currentWindow = manager.getCurrentWindow();
        var switcherWindowId = manager.getSwitcherWindowId();

        Promise.all([currentWindow, switcherWindowId]).apply(function (currentWindow, switcherWindowId) {
            // Don't activate the switcher from an existing switcher window.
            if (currentWindow.id == switcherWindowId) return;

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

chrome.runtime.onMessage.addListener(function (request, sender, respond) {
    if (request.switchToTabId) {
        manager.switchToTab(request.switchToTabId);
    }

    if (request.sendTabData) {
        Promise.all([history.getRecentTabs(), manager.getLastWindowId()]).apply(function (recentTabs, lastWindowId) {
            return manager.queryTabs(sender.tab.id, request.searchAllWindows, recentTabs, lastWindowId);
        }).then(function (data) {
            respond(data);
        });
        // We must return `true` so that Chrome leaves the messaging channel open, thus
        // allowing us to call `respond`.
        return true;
    }

    if (request.closeTabId) {
        manager.closeTab(request.closeTabId);
    }
});

/***/ }),

/***/ 34:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = tabHistory;
// This module keeps a list of recently activated tabs, and persists it to and
// from local storage. We use this data to allow the user to quicly bounce back
// and forth between tabs.
function tabHistory(chrome) {
    var recentTabs = null;

    return {
        getFromLocalStorage: function getFromLocalStorage(key) {
            return Promise.resolve(chrome.storage.local.get.bind(chrome.storage.local), key);
        },

        getAllWindows: function getAllWindows() {
            return Promise.resolve(chrome.windows.getAll);
        },

        getActiveTabs: function getActiveTabs() {
            console.log(chrome);
            return Promise.resolve(chrome.tabs.query.bind(chrome.tabs), { active: true });
        },

        getRecentTabs: function getRecentTabs() {
            if (!recentTabs) {
                storeData = this.getFromLocalStorage('lastTabs');
                windows = this.getAllWindows();
                recentTabs = Promise.all([storeData, windows]).apply(function (data, windows) {
                    try {
                        data = JSON.parse(data.lastTabs) || {};
                    } catch (error) {
                        data = {};
                    }
                    var ids = windows.map(function (win) {
                        return win.id.toString();
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

        addRecentTab: function addRecentTab(windowId, tabId, skipIfAlreadyRecent) {
            return this.getRecentTabs().then(function (tabs) {
                if (!tabs[windowId]) tabs[windowId] = [null];
                if (skipIfAlreadyRecent && tabs[windowId][1] == tabId) return;
                tabs[windowId].push(tabId);
                // We always want to display the next-to-most-recent tab to the user (as the
                // most recent tab is the one we're on now).
                while (tabs[windowId].length > 2) {
                    tabs[windowId].shift();
                }
                recentTabs = Promise.resolve(tabs);
            });
        },

        removeHistoryForWindow: function removeHistoryForWindow(windowId) {
            return this.getRecentTabs().then(function (tabs) {
                delete tabs[windowId];
                recentTabs = Promise.resolve(tabs);
            });
        },

        saveRecentTabs: function saveRecentTabs() {
            return Promise.resolve(recentTabs).then(function (tabs) {
                if (!tabs) return;
                chrome.storage.local.set({
                    lastTabs: JSON.stringify(tabs)
                });
            });
        }
    };
};

/***/ }),

/***/ 35:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = windowManager;
function windowManager(chrome) {
    var switcherWindowId = Promise.resolve(null);
    var lastWindowId = Promise.resolve(null);

    return {
        getTabInfo: function getTabInfo(tabId) {
            return Promise.resolve(chrome.tabs.get, tabId);
        },

        getCurrentWindow: function getCurrentWindow() {
            return Promise.resolve(chrome.windows.getCurrent);
        },

        getSwitcherWindowId: function getSwitcherWindowId() {
            return switcherWindowId;
        },

        setSwitcherWindowId: function setSwitcherWindowId(id) {
            switcherWindowId = Promise.resolve(id);
            return switcherWindowId;
        },

        getLastWindowId: function getLastWindowId() {
            return lastWindowId;
        },

        setLastWindowId: function setLastWindowId(id) {
            lastWindowId = Promise.resolve(id);
            return lastWindowId;
        },

        showSwitcher: function showSwitcher(width, height, left, top) {
            var opts = {
                width: width,
                height: height,
                left: left,
                top: top,
                url: chrome.runtime.getURL('build/html/switcher.html'),
                focused: true,
                type: 'popup'
            };

            return Promise.resolve(chrome.windows.create.bind(chrome.windows), opts).then(function (switcherWindow) {
                this.setSwitcherWindowId(switcherWindow.id);
            }.bind(this));
        },

        queryTabs: function queryTabs(senderTabId, searchAllWindows, recentTabs, lastWindowId) {
            var options = searchAllWindows ? {} : {
                windowId: lastWindowId
            };
            return Promise.resolve(chrome.tabs.query, options).then(function (tabs) {
                tabs = tabs.filter(function (tab) {
                    return tab.id != senderTabId;
                });
                return {
                    tabs: tabs,
                    lastActive: (recentTabs[lastWindowId] || [])[0] || null
                };
            });
        },

        switchToTab: function switchToTab(tabId) {
            chrome.tabs.update(tabId, { active: true });
            return this.getTabInfo(tabId).then(function (tab) {
                if (tab) chrome.windows.update(tab.windowId, { focused: true });
            });
        },

        closeTab: function closeTab(tabId) {
            return Promise.resolve(chrome.tabs.remove, tabId);
        }
    };
};

/***/ })

/******/ });