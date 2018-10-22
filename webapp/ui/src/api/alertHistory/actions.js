import reqwest from 'reqwest'

export const REQUEST_ALERT_HISTORY = 'REQUEST_ALERT_HISTORY'
export const RECEIVE_ALERT_HISTORY = 'RECEIVE_ALERT_HISTORY'
export const INVALIDATE_ALERT_HISTORY = 'INVALIDATE_ALERT_HISTORY'

export const SET_FAILURE_MESSAGE = 'SET_FAILURE_MESSAGE' 
export const FAILURE_MESSAGE = 'Service is currently unavailable. Please try again later!'

function setFailureMessage(message) {
  return {
    type: SET_FAILURE_MESSAGE,
    message
  }
}

function requestAlertHistory() {
  return {
    type: REQUEST_ALERT_HISTORY
  }
}

function receiveAlertHistory(alertHistory) {
  return {
    type: RECEIVE_ALERT_HISTORY,
    entries: alertHistory
  }
}

export function invalidateAlertHistory() {
  return {
    type: INVALIDATE_ALERT_HISTORY
  }
}

function fetchAlertHistory() {
  return dispatch => {
    dispatch(requestAlertHistory())
    return reqwest({
      url: 'api/alert-history/',
      method: 'get',
      type: 'json'
    }).then((alertHistory) => dispatch(receiveAlertHistory(alertHistory)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

function shouldFetchAlertHistory(state) {
  const alertHistoryEntity = state.alertHistoryReducer.alertHistoryEntity
  if (!alertHistoryEntity || alertHistoryEntity.failure) {
    return true
  } else if (alertHistoryEntity.isLoading) {
    return false
  } else {
    return alertHistoryEntity.didInvalidate
  }
}

export function fetchAlertHistoryIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchAlertHistory(getState())) {
      return dispatch(fetchAlertHistory())
    }
  }
}
