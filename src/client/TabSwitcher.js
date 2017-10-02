import React, {Component} from 'react';
import stringScore from 'string-score';
import tabFilter from './tab_filter';
import TabSearchBox from './TabSearchBox';
import TabList from './TabList';
import StatusBar from './StatusBar';

class TabSwitcher extends Component {
  constructor(props) {
    super(props);
    var searchAllWindows = localStorage.getItem('searchAllWindows');
    searchAllWindows = searchAllWindows ? JSON.parse(searchAllWindows) : false;
    this.state = {
      filter: '',
      selected: null,
      tabs: [],
      searchAllWindows: searchAllWindows
    }
    this.changeFilter = this.changeFilter.bind(this);
    this.getSelected = this.getSelected.bind(this);
    this.activateSelected = this.activateSelected.bind(this);
    this.modifySelected = this.modifySelected.bind(this);
    this.closeSelected = this.closeSelected.bind(this);
    this.changeSelected = this.changeSelected.bind(this);
    this.changeSearchAllWindows = this.changeSearchAllWindows.bind(this);
    this.filteredTabs = this.filteredTabs.bind(this);

  }

  componentDidMount() {
    window.onblur = this.close;
    this.refreshTabs();
  }

  render() {
    return (
      /* jshint ignore:start */
      <div>
        <TabSearchBox
          filter={this.state.filter}
          exit={this.close}
          changeFilter={this.changeFilter}
          activateSelected={this.activateSelected}
          modifySelected={this.modifySelected}
          closeSelected={this.closeSelected} />
        <TabList
          tabs={this.filteredTabs()}
          filter={this.state.filter}
          selectedTab={this.getSelected()}
          changeSelected={this.changeSelected}
          activateSelected={this.activateSelected}
          closeSelected={this.closeSelected} />
        <StatusBar
          searchAllWindows={this.state.searchAllWindows}
          changeSearchAllWindows={this.changeSearchAllWindows} />
      </div>
      /* jshint ignore:end */
    );
  }

  switchTo(tab) {
    chrome.runtime.sendMessage({switchToTabId: tab.id});
  }

  close(tab) {
    chrome.runtime.sendMessage({closeTabId: tab.id});
  }

  query(searchAllWindows) {
    var opts = {
      sendTabData: true,
      searchAllWindows: searchAllWindows
    };
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(opts, res => {
        console.log("msg: ", res);
        resolve(res);
    });
    }).then((val) => {
      console.log(val);      
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
  }

  refreshTabs() {
    this.query(this.state.searchAllWindows)
    .then((val) => {
      this.setState({tabs: val, selected: null});
    });
  }

  // We're calculating this on the fly each time instead of caching
  // it in the state because it is very much fast enough, and
  // simplifies some race-y areas of the component's lifecycle.
  filteredTabs() {
    console.log(this.state);
    return this.state.tabs.filter((val) => {
      console.log("TITLE: ",val.title);
      let str = val.title;
      console.log(typeof(str));
      return str.indexOf(this.state.filter) !== -1;
    }).sort();
    /*if (this.state.filter.trim().length) {
      return tabFilter(this.state.filter, this.state.tabs)
      .map(function(result) {
        return result.tab;
      });
    } else {
      return this.state.tabs;
    }
    */
  }

  getSelected() {
    return this.state.selected || this.filteredTabs()[0];
  }

  activateSelected() {
    var selected = this.getSelected();
    if (selected) {
      this.switchTo(selected);
      this.close();
    }
  }

  closeSelected() {
    /* jshint expr: true */
    var selected = this.getSelected();
    var index = this.state.tabs.indexOf(selected);

    if (selected) {
      this.modifySelected(1) || this.modifySelected(-1);
    }

    if (index > -1) {
      var tabs = this.state.tabs;
      tabs.splice(index, 1);
      this.setState({tabs: tabs});
    }

    tabBroker.close(selected);
  }

  changeFilter(newFilter) {
    this.setState({filter: newFilter, selected: null});
  }

  changeSelected(tab) {
    this.setState({selected: tab});
  }

  modifySelected(change) {
    var filteredTabs = this.filteredTabs();
    if (!filteredTabs.length) return;

    var currentIndex = filteredTabs.indexOf(this.getSelected());
    var newIndex = currentIndex + change;
    if (newIndex < 0) return false;
    if (newIndex >= filteredTabs.length) return false;
    var newTab = filteredTabs[newIndex];
    this.changeSelected(newTab);
    return true;
  }

  changeSearchAllWindows(value) {
    // TODO: move into a model
    localStorage.setItem('searchAllWindows', JSON.stringify(value));
    this.setState({searchAllWindows: value}, this.refreshTabs);
  }

  close() {
    //window.close();
  }
};

export default TabSwitcher;