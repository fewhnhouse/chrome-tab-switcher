
export default function(chrome) {
  let switcherWindowId = Promise.resolve(null);
  let lastWindowId = Promise.resolve(null);

  return {
    getTabInfo: function (tabId) {
      let p = new Promise((resolve, reject) => {
        chrome.tabs.get(tabId, (res) => resolve(res));
      })
      return p;
    },

    getCurrentWindow: function () {
      let p = new Promise((resolve, reject) => {
        chrome.windows.getCurrent((res) => resolve(res));
      })
      return p;
    },

    getSwitcherWindowId: function () {
      return switcherWindowId;
    },

    setSwitcherWindowId: function (id) {
      switcherWindowId = Promise.resolve(id);
      return switcherWindowId;
    },

    getLastWindowId: function () {
      return Promise.resolve(lastWindowId);
    },

    setLastWindowId: function (id) {
      lastWindowId = Promise.resolve(id);
      return lastWindowId;
    },

    showSwitcher: function (width, height, left, top) {
      let opts = {
        width: width,
        height: height,
        left: left,
        top: top,
        url: chrome.runtime.getURL('html/switcher.html'),
        focused: true,
        type: 'popup'
      };

      let p = new Promise((resolve, reject) => {
        chrome.windows.create(opts, (res) => resolve(res))
      })
      p.then((val) => {
        this.setSwitcherWindowId(val.id);
      });

      return p;
    },

    queryTabs: function (senderTabId, searchAllWindows, recentTabs, lastWindowId) {
      let options = searchAllWindows ? {} : { windowId: lastWindowId };
      return new Promise((resolve, reject) => {
        chrome.tabs.query(options, (res) => resolve(res));
      }).then((val) => {
        let tabs = val.filter((tab) => tab.id != senderTabId);
        return {
          tabs: tabs,
          lastActive: (recentTabs[lastWindowId] || [])[0] || null
        };
      });
    },

    switchToTab: function (tabId) {
      chrome.tabs.update(tabId, { active: true });
      return this.getTabInfo(tabId).then(function (tab) {
        if (tab) chrome.windows.update(tab.windowId, { focused: true });
      });
    },

    closeTab: function (tabId) {
      let p = new Promise((resolve, reject) => {
        chrome.tabs.remove(tabId, (res) => resolve(res));
      })
      return p;
    }
  };
};
