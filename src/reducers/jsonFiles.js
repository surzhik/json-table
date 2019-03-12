import { SET_JSONS_LIST } from '../constants';

export default function runtime(state = {}, action) {
  switch (action.type) {
    case SET_JSONS_LIST:
      return [...action.payload];
    default:
      return state;
  }
}
