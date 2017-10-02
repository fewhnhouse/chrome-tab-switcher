import React, { Component } from 'react';
import ReactDom from 'react-dom';
import stringSpanner from './string_spanner';
import Mousetrap from 'mousetrap';

var MATCH_START = '<span class="match">';
var MATCH_END = '</span>';

export default class TabItem extends Component {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onClickCloseButton = this.onClickCloseButton.bind(this);
  }

  componentDidMount() {
    Mousetrap.bind('del', () => this.props.closeSelected());
  }
  render() {
    var closeButton = this.props.selected ?
      <div className='close-button' onClick={this.onClickCloseButton}>&times;</div> : null;

    return (
      <li className={this.className()}
        onClick={this.onClick} onMouseEnter={this.onMouseEnter}>
        <div>
          <div className='bkg' style={this.iconBkg(this.props.tab)} />
          <span className='title'
            dangerouslySetInnerHTML={{ __html: this.tabTitle(this.props.tab) }} />
        </div>
        <div className='url'
          dangerouslySetInnerHTML={{ __html: this.tabUrl(this.props.tab) }} />
        {closeButton}
      </li>
    );
  }

  componentDidUpdate() {
    if (this.props.selected) {
      //this.ensureVisible();
    }
  }

  ensureVisible() {
    var node = ReactDom.findDOMNode(this);
    var myTop = node.offsetTop;
    var myBottom = myTop + node.offsetHeight;
    var containerScrollTop = this.props.containerScrollTop;
    var containerScrollBottom = containerScrollTop + this.props.containerHeight;

    if (myTop < containerScrollTop) this.props.setContainerScrollTop(myTop);
    if (myBottom > containerScrollBottom)
      this.props.setContainerScrollTop(containerScrollTop + myBottom - containerScrollBottom);
  }

  iconBkg(tab) {
    return { backgroundImage: "url(" + tab.favIconUrl + ")" };
  }

  className() {
    return this.props.selected ? "selected" : "";
  }

  tabTitle(tab) {
    return stringSpanner(tab.title, this.props.filter, MATCH_START, MATCH_END);
  }

  tabUrl(tab) {
    return stringSpanner(tab.url, this.props.filter, MATCH_START, MATCH_END);
  }

  onMouseEnter(evt) {
    this.props.changeSelected(this.props.tab);
  }

  onClick(evt) {
    this.props.activateSelected();
  }

  onClickCloseButton(evt) {
    evt.stopPropagation();
    this.props.closeSelected();
  }
};

