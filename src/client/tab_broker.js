
export default (chrome) => {
  var responses = {};

  return {
    query: function(searchAllWindows) {
      var opts = {
        sendTabData: true,
        searchAllWindows: searchAllWindows
      };
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(opts, res => resolve(res));
      }).then((val) => {
        var tabs = val.tabs;
        var lastActive = val.lastActive;
        var firstTab = [];
        var otherTabs = [];
        for(var idx in tabs) {
          var tab = tabs[idx];
          if (tab.id === lastActive) firstTab.push(tab);
          else otherTabs.push(tab);
        }
        return firstTab.concat(otherTabs);
      });
    },

    switchTo: function(tab) {
      chrome.runtime.sendMessage({switchToTabId: tab.id});
    },

    close: function(tab) {
      chrome.runtime.sendMessage({closeTabId: tab.id});
    }
  };
};
