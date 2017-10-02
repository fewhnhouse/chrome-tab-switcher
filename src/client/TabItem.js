import React, {Component} from 'react';

import stringSpanner from './string_spanner';

var MATCH_START = '<span class="match">';
var MATCH_END = '</span>';

export default class TabItem extends Component{
  render() {
    /* jshint ignore:start */
    var closeButton = this.props.selected ?
      <div className='close-button' onClick={this.onClickCloseButton}>&times;</div> : null;

    return (
      <li className={this.className()}
        onClick={this.onClick} onMouseEnter={this.onMouseEnter}>
        <div>
          <div className='bkg' style={this.iconBkg(this.props.tab)} />
          <span className='title'
            dangerouslySetInnerHTML={{__html: this.tabTitle(this.props.tab)}} />
        </div>
        <div className='url'
          dangerouslySetInnerHTML={{__html: this.tabUrl(this.props.tab)}} />
        {closeButton}
      </li>
    );
    /* jshint ignore:end */
  }

  componentDidUpdate() {
    if (this.props.selected) {
      this.ensureVisible();
    }
  }

  ensureVisible() {
    var node = this.getDOMNode();
    var myTop = node.offsetTop;
    var myBottom = myTop + node.offsetHeight;
    var containerScrollTop = this.props.containerScrollTop;
    var containerScrollBottom = containerScrollTop + this.props.containerHeight;

    if (myTop < containerScrollTop) this.props.setContainerScrollTop(myTop);
    if (myBottom > containerScrollBottom)
      this.props.setContainerScrollTop(containerScrollTop + myBottom - containerScrollBottom);
  }

  iconBkg(tab) {
    return {backgroundImage: "url(" + tab.favIconUrl + ")"};
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

