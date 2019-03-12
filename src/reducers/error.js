import { ERROR_CLEAR, ERROR_SET } from '../constants';

export default function runtime(
  state = {
    gotError: false,
    error: null,
    message: '',
  },
  action,
) {
  switch (action.type) {
    case ERROR_CLEAR:
      return {
        ...state,
        gotError: false,
        error: null,
        message: '',
      };
    case ERROR_SET:
      return {
        ...state,
        gotError: true,
        error: action.payload.error,
        message: action.payload.message,
      };
    default:
      return state;
  }
}
