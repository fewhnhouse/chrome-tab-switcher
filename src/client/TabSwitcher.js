/*global chrome */
import React, { Component } from 'react';
import TabSearchBox from './TabSearchBox';
import TabList from './TabList';
import StatusBar from './StatusBar';
import 'string_score';

class TabSwitcher extends Component {
  constructor(props) {
    super(props);
    let searchAllWindows = localStorage.getItem('searchAllWindows');
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
    this.close = this.close.bind(this);

  }

  componentDidMount() {
    window.onblur = this.close;
    this.refreshTabs();
  }

  render() {
    return (
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
    );
  }

  switchTo(tab) {
    chrome.runtime.sendMessage({ switchToTabId: tab.id });
  }
  openTab(tab) {
    chrome.runtime.sendMessage({openTab: tab});
  }
  closeTab(tab) {
    chrome.runtime.sendMessage({ closeTabId: tab.id });
  }

  query(searchAllWindows) {
    let opts = {
      sendTabData: true,
      searchAllWindows: searchAllWindows
    };
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(opts, res => {
        resolve(res);
      });
    }).then((val) => {
      let tabs = val.tabs;
      let lastActive = val.lastActive;
      let firstTab = [];
      let otherTabs = [];
      tabs.forEach((tab) => {
        tab.id === lastActive ? firstTab.push(tab) : otherTabs.push(tab);
      });
      return firstTab.concat(otherTabs);
    });
  }

  refreshTabs() {
    this.query(this.state.searchAllWindows)
      .then((val) => {
        this.setState({ tabs: val, selected: null });
      });
  }

  // We're calculating this on the fly each time instead of caching
  // it in the state because it is very much fast enough, and
  // simplifies some race-y areas of the component's lifecycle.
  filteredTabs() {
    let filteredArray =  this.state.tabs.filter((val) => {
      let title = val.title.toLowerCase();
      let url = val.url.toLowerCase();
      return title.includes(this.state.filter.toLowerCase()) || url.includes(this.state.filter.toLowerCase());
    });
    let arr = filteredArray.map((el) => {
      let titleScore = el.title.trim().score(this.state.filter.trim()) * 2;
      let urlScore = el.url.trim().score(this.state.filter.trim());
      let higherScore = titleScore >= urlScore ?
      titleScore : urlScore;
      return {
        tab: el,
        score: higherScore
      };
    });
    if (this.state.filter !== "") {
      return arr.filter((res) => res.score > 0).sort((a, b) => b.score - a.score).map(el => el.tab);
    } else {
      return arr.map(el => el.tab);
    }

  }

  getSelected() {
    return this.state.selected || this.filteredTabs()[0];
  }

  activateSelected() {
    let selected = this.getSelected();
    if (selected) {
      this.switchTo(selected);
      this.close();
      console.log("selected");
    } else {
      console.log("not selected");
      this.openTab(this.state.filter);
    }
  }

  closeSelected() {
    let selected = this.getSelected();
    let index = this.state.tabs.indexOf(selected);

    if (selected) {
      this.modifySelected(1) || this.modifySelected(-1);
    }

    if (index > -1) {
      let tabs = this.state.tabs;
      tabs.splice(index, 1);
      this.setState({ tabs: tabs });
    }

    this.closeTab(selected);
  }

  changeFilter(newFilter) {
    this.setState({ filter: newFilter, selected: null });
  }

  changeSelected(tab) {
    this.setState({ selected: tab });
  }

  modifySelected(change) {
    let filteredTabs = this.filteredTabs();
    if (!filteredTabs.length) return;

    let currentIndex = filteredTabs.indexOf(this.getSelected());
    let newIndex = currentIndex + change;
    if (newIndex < 0) return false;
    if (newIndex >= filteredTabs.length) return false;
    let newTab = filteredTabs[newIndex];
    this.changeSelected(newTab);
    return true;
  }

  changeSearchAllWindows(value) {
    // TODO: move into a model
    localStorage.setItem('searchAllWindows', JSON.stringify(value));
    this.setState({ searchAllWindows: value }, this.refreshTabs);
  }

  close() {
    window.close();
  }
};

export default TabSwitcher;