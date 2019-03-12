import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Pagination from '../Pagination';
import SelectPopOver from '../SelectPopOver';
import s from './TableSortable.css';

export class TableSortable extends React.Component {
  /* eslint-disable react/forbid-prop-types */
  static propTypes = {
    jsonFile: PropTypes.array, // data array from json file
    formatMoney: PropTypes.array, // colums names where data should be formated to Money
    formatBoolean: PropTypes.array, // colums names where data should formated to Yes/No
    filterColumn: PropTypes.array, // colums names where data can be filtered by unique value
    perPage: PropTypes.number, // rows count per page
  };

  static defaultProps = {
    jsonFile: [],
    formatMoney: [],
    formatBoolean: [],
    filterColumn: [],
    perPage: 10,
  };

  state = {
    data: null, // data for rendering table
    page: 0, // current page
    sortColumn: null, // column name with sorting
    sortDirection: null, // asc: true, desc: false, notSet: null
    filteredText: null, // text for column filter
    filteredColumn: null, // column name to be filtered
    showAllColumns: false, // key for show all columns
  };

  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({
      data: this.prepareData(),
    });
  }

  componentDidUpdate(prevProps) {
    /* eslint-disable react/no-did-update-set-state */
    const { jsonFile } = this.props;

    if (prevProps.jsonFile !== jsonFile) {
      this.setState({
        data: this.prepareData(),
        page: 0,
        sortColumn: null,
        sortDirection: null,
        filteredText: null,
        filteredColumn: null,
      });
    }
  }

  /** Selecting rows according to page number and perPage property.
   * returning [Array]
   */
  getRowsToShow = (rows, page) => {
    const { perPage } = this.props;
    return rows.slice(page * perPage, page * perPage + perPage);
  };

  /** Preparing data rows [array] of cells [arrays] for table view.
   * returning [Array] of [Arrays]
   */
  collectRows = (columns, rows) =>
    rows.map(row => {
      const cells = Array(columns.length).fill('');
      Object.keys(row).forEach(cell => {
        cells[
          columns.findIndex(column => column.name === cell)
        ] = this.checkCellFormat(cell, row[cell]);
      });
      return cells;
    });

  /** Looking format arrays with column names for data formatting.
   *  Changing value according format if found.
   * returning 'String'
   */
  checkCellFormat = (key, value) => {
    const { formatMoney, formatBoolean } = this.props;
    if (formatMoney.indexOf(key) >= 0) {
      return `$${this.formatMoney(value)}`;
    } else if (formatBoolean.indexOf(key) >= 0) {
      return value ? 'Yes' : 'No';
    }
    return value;
  };

  /** Preparing data columns from json data. Searching for all unique keys in each object
   * Checking key popularity. Setting isHidden flag to true, if key popularity < 20%.
   * returning [Array] of {Objects}
   */
  collectColumns = data => {
    const keysCount = {};
    const dataLength = data.length;
    data.forEach(record => {
      Object.keys(record).forEach(key => {
        if (!keysCount[key]) {
          keysCount[key] = 1;
        } else {
          keysCount[key] += 1;
        }
      });
    });
    return Object.keys(keysCount).map(name => ({
      name,
      isHidden: (keysCount[name] / dataLength) * 100 < 20,
    }));
  };

  /** Separating json data into usable parts. See description below.
   * returning {Object}
   */
  prepareData = () => {
    const { jsonFile, filterColumn } = this.props;
    const { perPage } = this.props;
    if (!jsonFile) {
      return null;
    }
    const columns = this.collectColumns(jsonFile); // table head
    const rows = this.collectRows(columns, jsonFile); // table body
    const pages = Math.floor(rows.length / perPage); // total pages
    const gotHiddenColumn = columns.find(column => column.isHidden); // got hidden columns
    const rowsToShow = this.getRowsToShow(rows, 0); // rows according to page and perPage
    const uniqueValues = {}; // collect unique values for columns within filterColumn
    filterColumn.forEach(columnName => {
      const targetIndex = columns.findIndex(
        column => column.name === columnName,
      );
      uniqueValues[columnName] = [
        ...new Set(rows.map(item => item[targetIndex])),
      ].sort((rowA, rowB) => {
        if (rowA > rowB) {
          return 1;
        }
        if (rowA < rowB) {
          return -1;
        }
        return 0;
      });
    });

    return {
      columns, // Array of table columns objects: {name, idHidden}
      rowsSorted: rows, // Rows array with sorting apply
      rowsUnsorted: rows, // Rows array with original data
      rowsToShow, // Slicing Rows array according to page and perPage propery
      pages, // Total pages
      gotHiddenColumn, // Key for avoid check every time
      uniqueValues, // Object key: Array with unique values in row
    };
  };

  /** Formatting value into money view: 111,000.00.
   * returning 'String'
   */
  formatMoney = money =>
    money
      ? money
          .toFixed(2)
          .replace(/./g, (c, i, a) =>
            i && c !== '.' && (a.length - i) % 3 === 0 ? `,${c}` : c,
          )
      : '';

  /** Toggle all columns view
   */
  toggleColumns = () => {
    this.setState({
      showAllColumns: !this.state.showAllColumns,
    });
  };

  /** Apply sort order on clicked column. Also looked into filtered data
   * setting new data{Object} into state
   */
  handleSortOrder = indexColumn => {
    const {
      sortColumn,
      sortDirection,
      filteredColumn,
      filteredText,
    } = this.state;
    const { perPage } = this.props;
    const data = JSON.parse(JSON.stringify(this.state.data));
    const targetColumn = data.columns[indexColumn].name;
    let targetDirection = null;
    if (targetColumn !== sortColumn) {
      targetDirection = true;
    } else if (sortDirection) {
      targetDirection = false;
    }

    data.rowsSorted = [...data.rowsUnsorted];
    if (targetDirection !== null) {
      data.rowsSorted.sort((rowA, rowB) => {
        const aCell = rowA[indexColumn];
        const bCell = rowB[indexColumn];
        if (aCell > bCell) {
          return targetDirection ? 1 : -1;
        }
        if (aCell < bCell) {
          return targetDirection ? -1 : 1;
        }
        return 0;
      });
    }
    if (filteredColumn && filteredText) {
      const targetColumnIndex = data.columns.findIndex(
        column => column.name === filteredColumn,
      );
      data.rowsSorted = [...data.rowsSorted].filter(
        row => row[targetColumnIndex] === filteredText,
      );
      data.pages = Math.floor(data.rowsSorted.length / perPage);
    }

    data.rowsToShow = this.getRowsToShow(data.rowsSorted, 0);

    this.setState({
      data,
      sortDirection: targetDirection,
      sortColumn: targetDirection !== null ? targetColumn : null,
      page: 0,
    });
  };

  /** Changing page and slicing sortedData into rowsToShow array
   * setting new data{Object} and page{Number} into state
   */
  handlePageChange = nextPage => {
    const data = JSON.parse(JSON.stringify(this.state.data));
    data.rowsToShow = this.getRowsToShow(data.rowsSorted, nextPage);

    this.setState({
      page: nextPage,
      data,
    });
  };

  /** Apply selected filter on clicked column. Also looked into sorting data
   * setting new data{Object}, page{Number}, filteredText'String' and
   filteredColumn'String' into state
   */
  handleFilterChange = (filteredColumn, filteredText) => {
    const { sortColumn, sortDirection } = this.state;
    const { perPage } = this.props;
    const data = JSON.parse(JSON.stringify(this.state.data));
    const indexColumn = data.columns.findIndex(
      column => column.name === sortColumn,
    );

    if (filteredColumn) {
      const targetColumnIndex = data.columns.findIndex(
        column => column.name === filteredColumn,
      );
      data.rowsSorted = [...data.rowsUnsorted].filter(
        row => row[targetColumnIndex] === filteredText,
      );
    } else {
      data.rowsSorted = [...data.rowsUnsorted];
    }

    if (sortDirection !== null) {
      data.rowsSorted.sort((rowA, rowB) => {
        const aCell = rowA[indexColumn];
        const bCell = rowB[indexColumn];
        if (aCell > bCell) {
          return sortDirection ? 1 : -1;
        }
        if (aCell < bCell) {
          return sortDirection ? -1 : 1;
        }
        return 0;
      });
    }

    data.rowsToShow = this.getRowsToShow(data.rowsSorted, 0);
    data.pages = Math.floor(data.rowsSorted.length / perPage);
    this.setState({
      data,
      page: 0,
      filteredText,
      filteredColumn,
    });
  };

  render() {
    /* eslint-disable no-nested-ternary */
    const {
      data,
      page,
      showAllColumns,
      sortColumn,
      sortDirection,
      filteredColumn,
    } = this.state;

    const { perPage } = this.props;
    return (
      <div className={s.tableHolder}>
        {data && (
          <div className={s.tableOver}>
            {data.gotHiddenColumn && (
              <div className={s.buttonHolder}>
                <button
                  className="btn btn-secondary"
                  onClick={this.toggleColumns}
                >
                  {showAllColumns
                    ? 'Hide secondary columns'
                    : 'Show all columns'}
                </button>
              </div>
            )}
            <div className="h5">
              Page {page + 1} from {data.pages}
            </div>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    {data.columns.map((column, indexColumn) => (
                      <th
                        scope="col"
                        key={column.name}
                        className={
                          column.isHidden && !showAllColumns ? s.isHidden : null
                        }
                      >
                        {/* eslint-disable jsx-a11y/click-events-have-key-events */}
                        {/* eslint-disable jsx-a11y/no-static-element-interactions */}
                        <span
                          className={s.columnTitle}
                          onClick={() => this.handleSortOrder(indexColumn)}
                        >
                          {column.name}
                        </span>
                        {sortColumn === column.name ? (
                          <span
                            className={`${s.sortOrder} ${
                              sortDirection ? s.Up : s.Down
                            }`}
                          />
                        ) : (
                          <span className={s.sortOrder} />
                        )}
                        {data.uniqueValues[column.name] && (
                          <SelectPopOver
                            items={data.uniqueValues[column.name]}
                            targetName={column.name}
                            gotFilter={column.name === filteredColumn}
                            onChange={this.handleFilterChange}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable react/no-array-index-key */}
                  {data.rowsToShow.map((row, indexRow) => (
                    <tr key={`cell_${indexRow}`}>
                      <th scope="row">{page * perPage + indexRow + 1}</th>
                      {row.map((cell, indexCell) => (
                        <td
                          key={`cell_${indexRow}_${indexCell}`}
                          className={
                            data.columns[indexCell].isHidden && !showAllColumns
                              ? s.isHidden
                              : null
                          }
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pages={data.pages}
              onChange={this.handlePageChange}
            />
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(s)(TableSortable);
