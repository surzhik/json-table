import React from 'react';
import HomePage from './Home';

function action() {
  return {
    title: 'Table Sortable',
    chunks: ['home'],
    component: <HomePage />,
  };
}
export default action;
