/* eslint-disable import/prefer-default-export */

import { SET_JSONS_LIST } from '../constants';

export function setJsonFiles(payload) {
  return {
    type: SET_JSONS_LIST,
    payload,
  };
}
