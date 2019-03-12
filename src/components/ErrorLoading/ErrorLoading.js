import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ErrorLoading.css';

class ErrorLoading extends React.PureComponent {
  static propTypes = {
    message: PropTypes.string,
  };

  static defaultProps = {
    message: '',
  };

  render() {
    const { message } = this.props;
    return (
      <div className={s.errorHolder}>
        <div className="alert alert-danger ">
          <h4>Oh, no! It is an Error!</h4>
          {message && <p>{message}</p>}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ErrorLoading);
