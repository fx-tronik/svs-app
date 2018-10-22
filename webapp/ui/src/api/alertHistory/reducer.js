import { combineReducers } from 'redux'

import { REQUEST_ALERT_HISTORY, RECEIVE_ALERT_HISTORY, INVALIDATE_ALERT_HISTORY, SET_FAILURE_MESSAGE } from './actions'

function alertHistoryEntity(
  state = {
    isLoading: false,
    didInvalidate: true,
    entries: [],
    failure: null
  },
  action
) {
  switch (action.type) {
    case INVALIDATE_ALERT_HISTORY:
      return Object.assign({}, state, {
        didInvalidate: true,
	failure: null
      })
    case REQUEST_ALERT_HISTORY:
      return Object.assign({}, state, {
        isLoading: true,
	failure: null,
        didInvalidate: false
      })
    case RECEIVE_ALERT_HISTORY:
      return Object.assign({}, state, {
        isLoading: false,
        didInvalidate: false,
        entries: action.entries
      })
    case SET_FAILURE_MESSAGE:
      return Object.assign({}, state, {
        isLoading: false,
        didInvalidate: false,
	failure: action.message
      })
    default:
      return state
  }
}

const historyOfAlertsReducer = combineReducers({
  alertHistoryEntity
})

export default historyOfAlertsReducer
