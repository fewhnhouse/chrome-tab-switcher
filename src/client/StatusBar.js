import KeybindMixin from './keybind_mixin';
import React, {Component} from 'react';

class StatusBar extends KeybindMixin {

  componentDidMount() {
    this.bindKey(['alt+a'], this.toggleSearchAllWindows);
  }

  render() {
    return (
      /* jshint ignore:start */
      <label className='status'>
        <input type='checkbox' checked={this.props.searchAllWindows}
          onChange={this.onChange} />
        <span>Show tabs from <u>a</u>ll windows</span>
      </label>
      /* jshint ignore:end */
    );
  }

  toggleSearchAllWindows() {
    this.props.changeSearchAllWindows(!this.props.searchAllWindows);
  }

  onChange(evt) {
    this.props.changeSearchAllWindows(evt.target.checked);
  }
}


export default StatusBar;