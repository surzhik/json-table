import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import normalizeCss from 'normalize.css';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';
import Table from '../../components/TableSortable';
import s from './Home.css';

function mapStateToProps({ jsonFiles }) {
  return {
    jsonFiles,
  };
}

export class Home extends React.Component {
  /* eslint-disable react/forbid-prop-types */

  static propTypes = {
    jsonFiles: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
  };

  static defaultProps = {};

  state = {
    jsonFile: null,
  };

  handleChangeSelect = event => {
    const { jsonFiles } = this.props;
    const jsonFile = jsonFiles[event.target.value];
    this.setState({
      jsonFile: jsonFile ? jsonFile.data : null,
    });
  };

  render() {
    const { jsonFiles } = this.props;
    const { jsonFile } = this.state;

    return (
      <div className={s.wrap}>
        <div className="container-fluid">
          {jsonFiles && jsonFiles.length > 0 ? (
            <div className="form-group">
              <label htmlFor="jsonSelect">JSON file to display:</label>
              <form autoComplete="off">
                <select
                  className="form-control"
                  id="jsonSelect"
                  onChange={this.handleChangeSelect}
                >
                  <option value="-1">Please, select</option>
                  {jsonFiles.map((file, index) => (
                    <option key={file.name} value={index}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </form>
            </div>
          ) : (
            <div className="alert-danger">
              No JSON files found in /data folder
            </div>
          )}
          {jsonFile && (
            <Table
              jsonFile={jsonFile}
              formatMoney={['armor_costs', 'logistic_costs']} // format cells for money
              formatBoolean={['battle_won']} // format cells for Yes/No
              filterColumn={['location']}
            />
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(
  withStyles(s, normalizeCss, bootstrap)(Home),
);
