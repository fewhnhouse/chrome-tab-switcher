import React, { Component } from 'react';
import ReactDom from 'react-dom';
import Mousetrap from 'mousetrap';


class TabSearchBox extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.selectNext = this.selectNext.bind(this);
    this.selectPrevious = this.selectPrevious.bind(this);
  }
  componentDidUpdate() {
    this.nameInput.focus();
  }

  componentDidMount() {
    Mousetrap.bind('esc', this.props.exit);
    Mousetrap.bind('enter', this.props.activateSelected);
    Mousetrap.bind('up', this.selectPrevious);
    Mousetrap.bind('down', this.selectNext);
  }

  componentWillUnmount() {
    Mousetrap.reset();
  }

  render() {
    return (
      <input placeholder="Type to filter tabs..." className="mousetrap" type='text' ref={(input) => { this.nameInput = input; }}
        autoFocus='true' onChange={this.onChange} />
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