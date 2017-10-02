import TabItem from './TabItem';
import React, {Component} from 'react';
import ReactDom from 'react-dom';

export default class TabList extends Component {
  constructor(props) {
    super(props);
    this.getHeight = this.getHeight.bind(this);
    this.getScrollTop = this.getScrollTop.bind(this);
    this.setScrollTop = this.setScrollTop.bind(this);
    this.state={
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

  render(){
    return (
      /* jshint ignore:start */
      <ul>
        {this.props.tabs.map(function(tab, i) {
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
      /* jshint ignore:end */
    );
  }

  getHeight() {
    return ReactDom.findDOMNode(this).offsetHeight;
  }

  getScrollTop() {
    return ReactDom.findDOMNode(this).scrollTop;
  }

  setScrollTop(val) {
    ReactDom.findDOMNode().scrollTop = val;
  }
}

