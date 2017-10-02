import React, {Component} from 'react';
import Mousetrap from 'mousetrap';

export default class KeybindMixin extends Component {
    componentWillMount() {
      this._boundKeys = [];
    }
  
    bindKey(key, fn) {
      console.log("binding key");
      this._boundKeys.push(key);
      Mousetrap.bind(key, function(evt) {
        evt.preventDefault();
        fn(evt);
      }.bind(this));
    }
  
    componentWillUnmount() {
      this._boundKeys.map(Mousetrap.unbind);
    }
  };
  