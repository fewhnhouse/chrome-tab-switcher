import TabItem from './TabItem';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class TabList extends Component {
  constructor(props) {
    super(props);
    this.getHeight = this.getHeight.bind(this);
    this.getScrollTop = this.getScrollTop.bind(this);
    this.setScrollTop = this.setScrollTop.bind(this);
    this.state = {
      scrollTop: 0,
      height: 0,
    }
  }

  componentDidMount() {
    this.setState({
      scrollTop: this.getScrollTop(),
      height: this.getHeight()
    })
  }

  render() {
    return (
      <ul>
        {this.props.tabs.map(function (tab, i) {
          return <TabItem tab={tab} key={tab.id} filter={this.props.filter}
            selected={this.props.selectedTab === tab}
            changeSelected={this.props.changeSelected}
            activateSelected={this.props.activateSelected}
            closeSelected={this.props.closeSelected}
            containerScrollTop={this.state.scrollTop}
            containerHeight={this.state.height}
            setContainerScrollTop={this.setScrollTop} />;
        }.bind(this))}
      </ul>
    );
  }

  getHeight() {
    return ReactDOM.findDOMNode(this).offsetHeight;
  }

  getScrollTop() {
    return ReactDOM.findDOMNode(this).scrollTop;
  }

  setScrollTop(val) {
    ReactDOM.findDOMNode(this).scrollTop = val;
  }
}

