import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './SelectPopOver.css';

class SelectPopOver extends React.Component {
  /* eslint-disable react/forbid-prop-types */
  static propTypes = {
    items: PropTypes.array.isRequired,
    targetName: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    gotFilter: PropTypes.bool.isRequired,
  };

  state = {
    isOpened: false,
  };

  componentDidMount() {
    document.body.addEventListener('click', this.handleBlur);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleBlur);
  }

  popOverRef = React.createRef();

  /** Looking into click target and hide popOver if it was out container
   * setting new isOpened{Bool} into state
   */
  handleBlur = event => {
    if (
      !this.popOverRef ||
      (this.popOverRef && !this.popOverRef.current.contains(event.target))
    ) {
      this.setState({
        isOpened: false,
      });
    }
  };

  toggleOpen = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    });
  };

  applyFilter = (event, value) => {
    event.preventDefault();
    const { onChange, targetName } = this.props;
    onChange(value ? targetName : null, value);
    this.setState({ isOpened: false });
  };

  render() {
    const { items, gotFilter } = this.props;
    const { isOpened } = this.state;
    return (
      <div
        className={`${s.popOverHolder} ${isOpened ? s.opened : null}`}
        ref={this.popOverRef}
      >
        <button className={s.toggleFilter} onClick={this.toggleOpen} />
        <div className={s.listHolder}>
          <ul>
            {items.map(item => (
              <li key={item}>
                <button
                  className="btn btn-link"
                  onClick={event => this.applyFilter(event, item)}
                >
                  {item}
                </button>
              </li>
            ))}
            <li>
              {gotFilter && (
                <button
                  className="btn small btn-secondary"
                  onClick={event => this.applyFilter(event, null)}
                >
                  Clear Filter
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

SelectPopOver.propTypes = {
  items: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};
export default withStyles(s)(SelectPopOver);
