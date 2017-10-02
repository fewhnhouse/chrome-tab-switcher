import KeybindMixin from './keybind_mixin';
import React, { Component } from 'react';
import ReactDom from 'react-dom';


class TabSearchBox extends KeybindMixin {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  componentDidMount() {
    this.nameInput.focus(); 
  }

  componentDidMount() {
    this.bindKey('esc', this.props.exit);
    this.bindKey('enter', this.props.activateSelected);
    this.bindKey('up', this.selectPrevious);
    this.bindKey('down', this.selectNext);
  }

  componentWillUnmount() {
    Mousetrap.reset();
  }

  render() {
    return (
      /* jshint ignore:start */
      <input type='text' ref={(input) => { this.nameInput = input; }}
        autoFocus='true' onChange={this.onChange} />
      /* jshint ignore:end */
    );
  }

  selectPrevious() {
    this.props.modifySelected(-1);
  }

  selectNext() {
    this.props.modifySelected(1);
  }

  onChange(evt) {
    if (evt.target.value !== this.props.filter)
      this.props.changeFilter(evt.target.value);
  }
}

export default TabSearchBox;