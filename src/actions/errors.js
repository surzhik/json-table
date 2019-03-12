/* eslint-disable import/prefer-default-export */
import { ERROR_CLEAR, ERROR_SET } from '../constants';

export function errorClear() {
  return {
    type: ERROR_CLEAR,
  };
}
export function errorSet({ error, message }) {
  return {
    type: ERROR_SET,
    payload: {
      error,
      message,
    },
  };
}
