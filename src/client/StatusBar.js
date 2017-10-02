import React, {Component} from 'react';
import Mousetrap from 'mousetrap';

class StatusBar extends Component {

  constructor(props) {
    super(props);
    this.toggleSearchAllWindows = this.toggleSearchAllWindows.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  componentDidMount() {
    Mousetrap.bind(['alt+a'], this.toggleSearchAllWindows);
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