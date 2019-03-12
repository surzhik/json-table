import { combineReducers } from 'redux';
import jsonFiles from './jsonFiles';
import runtime from './runtime';
import error from './error';

export default combineReducers({
  jsonFiles,
  error,
  runtime,
});
