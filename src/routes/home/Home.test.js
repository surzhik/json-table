/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */

import React from 'react';
import renderer from 'react-test-renderer';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Loader from '../../components/Loader';
import { Home } from './Search';

configure({ adapter: new Adapter() });

describe('Search container', () => {
  const searchMovies = jest.fn();
  const props = {
    loading: false,
    suggestions: [],
    actions: {
      searchMovies,
    },
  };

  const state = {
    suggestions: [], // list of suggestions
    searchText: '',
    showSuggest: false,
    fetching: false,
  };

  describe('Search structure', () => {
    test('renders children correctly', () => {
      const wrapper = renderer.create(<Home {...props} />).toJSON();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('Header initial', () => {
    const headerContainer = shallow(<Home {...props} />);
    it('Render input', () => {
      expect(headerContainer.find('input')).toHaveLength(1);
    });
  });

  describe('Initial state', () => {
    const headerContainer = shallow(<Home {...props} />);
    it('Initial state', () => {
      headerContainer.setState(state);
      expect(headerContainer.state()).toEqual(state);
    });
  });

  describe('State changes and Actions calling', () => {
    jest.useFakeTimers();
    const headerContainer = shallow(<Home {...props} />);

    const searchText = 'Some text';
    beforeEach(() => {
      headerContainer.find('#searchInput').simulate('change', {
        currentTarget: {
          value: searchText,
        },
      });
    });

    it('updates searchText field in state', () => {
      expect(headerContainer.state().searchText).toEqual(searchText);
    });

    it('Action calling', () => {
      setTimeout(() => {
        expect(searchMovies).toHaveBeenCalledTimes(1);
      }, 1500);
    });
  });
  jest.runAllTimers();
});
