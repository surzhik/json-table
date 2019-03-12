/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */

import React from 'react';
import renderer from 'react-test-renderer';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { TableSortable } from './TableSortable';
import { Home } from '../../routes/home/Home';

configure({ adapter: new Adapter() });

describe('Table body', () => {
  const props = {
    jsonFile: [],
    formatMoney: [],
    formatBoolean: [],
    filterColumn: [],
  };

  const state = {
    data: null,
    page: 0,
    sortColumn: null,
    sortDirection: null,
    filteredText: null,
    filteredColumn: null,
    perPage: 10,
    showAllColumns: false,
  };

  describe('Home load', () => {
    test('renders children correctly', () => {
      const wrapper = renderer.create(<TableSortable {...props} />).toJSON();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('Holder initial', () => {
    const headerContainer = shallow(<TableSortable {...props} />);
    it('Render holder', () => {
      expect(headerContainer.find('.tableHolder')).toHaveLength(1);
    });
  });

  describe('Initial state', () => {
    const headerContainer = shallow(<TableSortable {...props} />);
    it('Initial state', () => {
      headerContainer.setState(state);
      expect(headerContainer.state()).toEqual(state);
    });
  });

  describe('Adding data', () => {
    jest.useFakeTimers();
    const headerContainer = shallow(<TableSortable {...props} />);
    state.data = {
      columns: [{ name: 'Test', isHidden: false }],
      rowsSorted: [[1], [2]],
      rowsUnsorted: [[1], [2]],
      rowsToShow: [[1], [2]],
      pages: 1,
      gotHiddenColumn: false,
      uniqueValues: {},
    };

    beforeEach(() => {
      headerContainer.setState(state);
    });

    it('Render table', () => {
      expect(headerContainer.find('.table')).toHaveLength(1);
    });
  });
  jest.runAllTimers();
});
