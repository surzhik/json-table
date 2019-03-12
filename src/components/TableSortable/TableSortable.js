import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Pagination from '../Pagination';
import SelectPopOver from '../SelectPopOver';
import s from './TableSortable.css';

export class TableSortable extends React.Component {
  /* eslint-disable react/forbid-prop-types */
  static propTypes = {
    jsonFile: PropTypes.array,
    formatMoney: PropTypes.array,
    formatBoolean: PropTypes.array,
    filterColumn: PropTypes.array,
  };

  static defaultProps = {
    jsonFile: [],
    formatMoney: [],
    formatBoolean: [],
    filterColumn: [],
  };

  state = {
    data: null,
    page: 0,
    sortColumn: null,
    sortDirection: null,
    filteredText: null,
    filteredColumn: null,
    perPage: 10,
    showAllColumns: false,
  };

  componentDidMount() {
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

  checkCellFormat = (key, value) => {
    const { formatMoney, formatBoolean } = this.props;
    if (formatMoney.indexOf(key) >= 0) {
      return `$${this.formatMoney(value)}`;
    } else if (formatBoolean.indexOf(key) >= 0) {
      return value ? 'Yes' : 'No';
    }
    return value;
  };

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

  getRowsToShow = (rows, page) => {
    const { perPage } = this.state;
    return rows.slice(page * perPage, page * perPage + perPage);
  };

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
    return Object.keys(keysCount).map(name => {
      return { name, isHidden: (keysCount[name] / dataLength) * 100 < 20 };
    });
  };

  prepareData = () => {
    const { jsonFile, filterColumn } = this.props;
    const { perPage } = this.state;
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
      columns,
      rowsSorted: rows,
      rowsUnsorted: rows,
      rowsToShow,
      pages,
      gotHiddenColumn,
      uniqueValues,
    };
  };

  formatMoney = money =>
    money
      ? money
          .toFixed(2)
          .replace(
            /./g,
            (c, i, a) =>
              i && c !== '.' && (a.length - i) % 3 === 0 ? `,${c}` : c,
          )
      : '';

  toggleColumns = () => {
    this.setState({
      showAllColumns: !this.state.showAllColumns,
    });
  };

  handleSortOrder = indexColumn => {
    const {
      sortColumn,
      sortDirection,
      filteredColumn,
      filteredText,
      perPage,
    } = this.state;
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

  handlePageChange = nextPage => {
    const data = JSON.parse(JSON.stringify(this.state.data));
    data.rowsToShow = this.getRowsToShow(data.rowsSorted, nextPage);

    this.setState({
      page: nextPage,
      data,
    });
  };

  handleFilterChange = (filteredColumn, filteredText) => {
    const { perPage, sortColumn, sortDirection } = this.state;
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
      perPage,
      showAllColumns,
      sortColumn,
      sortDirection,
    } = this.state;
    console.log(data);

    return (
      <div className={s.tableHolder}>
        {data && (
          <div className={s.tableOver}>
            {data.gotHiddenColumn && (
              <div className={s.buttonHolder}>
                <button className="btn btn-secondary" onClick={this.toggleColumns}>
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
                        <span
                          className={s.columnTitle}
                          onClick={() => this.handleSortOrder(indexColumn)}
                        >
                          {column.name}
                        </span>
                        {sortColumn === column.name && (
                          <span
                            className={`${s.sortOrder} ${!sortDirection &&
                              s.Down}`}
                          />
                        )}
                        {data.uniqueValues[column.name] && (
                          <SelectPopOver
                            items={data.uniqueValues[column.name]}
                            targetName={column.name}
                            onChange={this.handleFilterChange}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
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
