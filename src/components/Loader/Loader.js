/* eslint-disable react/no-array-index-key */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Loader.css';

class Loader extends React.PureComponent {
  render() {
    return (
      <div className={s.loading}>
        <div />
        <div />
        <div />
        <div />
      </div>
    );
  }
}

export default withStyles(s)(Loader);
