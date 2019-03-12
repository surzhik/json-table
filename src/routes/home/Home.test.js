/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */

import React from 'react';
import renderer from 'react-test-renderer';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Home } from './Home';

configure({ adapter: new Adapter() });

describe('Table container', () => {
  const props = {
    jsonFiles: [{ name: 'report_100.json' }],
  };

  const state = {
    jsonFile: null,
  };

  describe('Home load', () => {
    test('renders children correctly', () => {
      const wrapper = renderer.create(<Home {...props} />).toJSON();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('Header initial', () => {
    const headerContainer = shallow(<Home {...props} />);
    it('Render select', () => {
      expect(headerContainer.find('#jsonSelect')).toHaveLength(1);
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

    const selectedValue = 0;
    beforeEach(() => {
      headerContainer.find('select').simulate('change', {
        target: {
          value: selectedValue,
        },
      });
    });

    it('Updates jsonFile field in state', () => {
      expect(headerContainer.state().jsonFile).not.toBeNull();
    });
  });
  jest.runAllTimers();
});
