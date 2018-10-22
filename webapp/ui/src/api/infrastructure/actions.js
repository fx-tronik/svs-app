import reqwest from 'reqwest'

export const REQUEST_INFRASTRUCTURE_STATE = 'REQUEST_INFRASTRUCTURE_STATE'
export const RECEIVE_INFRASTRUCTURE_STATE = 'RECEIVE_INFRASTRUCTURE_STATE'
export const INVALIDATE_INFRASTRUCTURE_STATE = 'INVALIDATE_INFRASTRUCTURE_STATE'

export const REQUEST_DELETION_FROM_INFRASTRUCTURE = 'REQUEST_DELETION_FROM_INFRASTRUCTURE'
export const CONFIRM_DELETION_FROM_INFRASTRUCTURE = 'CONFIRM_DELETION_FROM_INFRASTRUCTURE'

export const REQUEST_INFRASTRUCTURE_ACTUALIZATION = 'REQUEST_INFRASTRUCTURE_ACTUALIZATION'
export const CONFIRM_INFRASTRUCTURE_ACTUALIZATION = 'CONFIRM_INFRASTRUCTURE_ACTUALIZATION'

export const REQUEST_ADDITION_INTO_INFRASTRUCTURE = 'REQUEST_ADDITION_INTO_INFRASTRUCTURE'
export const CONFIRM_ADDITION_INTO_INFRASTRUCTURE = 'CONFIRM_ADDITION_INTO_INFRASTRUCTURE'

export const SET_FAILURE_MESSAGE = 'SET_FAILURE_MESSAGE' 
export const FAILURE_MESSAGE = 'Service is currently unavailable. Please try again later!'

function setFailureMessage(message) {
  return {
    type: SET_FAILURE_MESSAGE,
    message
  }
}

function requestDeletionFromInfrastructure() {
  return {
    type: REQUEST_DELETION_FROM_INFRASTRUCTURE
  }
}

function confirmDeletionFromInfrastructure(id) {
  return {
    type: CONFIRM_DELETION_FROM_INFRASTRUCTURE,
    id
  }
}

function requestInfrastructureActualization() {
  return {
    type: REQUEST_INFRASTRUCTURE_ACTUALIZATION
  }
}

function confirmInfrastructureActualization(id, newValue) {
  return {
    type: CONFIRM_INFRASTRUCTURE_ACTUALIZATION,
    id,
    newValue
  }
}

function requestAdditionIntoInfrastructure() {
  return {
    type: REQUEST_ADDITION_INTO_INFRASTRUCTURE
  }
}

function confirmAdditionIntoInfrastructure(data) {
  return {
    type: CONFIRM_ADDITION_INTO_INFRASTRUCTURE,
    data
  }
}

function requestInfrastructureState() {
  return {
    type: REQUEST_INFRASTRUCTURE_STATE
  }
}

function receiveInfrastructureState(infrastructureState) {
  return {
    type: RECEIVE_INFRASTRUCTURE_STATE,
    entries: infrastructureState
  }
}

export function invalidateInfrastructureState() {
  return {
    type: INVALIDATE_INFRASTRUCTURE_STATE
  }
}

function fetchInfrastructureState() {
  return dispatch => {
    dispatch(requestInfrastructureState())
    return reqwest({
      url: 'api/infrastructure/',
      method: 'get',
      type: 'json'
    }).then((infrastructureState) => dispatch(receiveInfrastructureState(infrastructureState)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

function shouldFetchInfrastructureState(state) {
  const infrastructureEntity = state.infrastructureReducer.infrastructureEntity
  if (!infrastructureEntity || infrastructureEntity.failure) {
    return true
  } else if (infrastructureEntity.isLoading) {
    return false
  } else {
    return infrastructureEntity.didInvalidate
  }
}

export function fetchInfrastructureStateIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchInfrastructureState(getState())) {
      return dispatch(fetchInfrastructureState())
    }
  }
}

export function deleteInfrastructureComponentById(id) {
  return dispatch => {
    dispatch(requestDeletionFromInfrastructure())
    return reqwest({
      url: 'api/infrastructure/' + id + '/',
      method: 'delete',
      type: 'json'
    }).then((response) => dispatch(confirmDeletionFromInfrastructure(id)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

export function updateInfrastructureComponent(id, newValue) {
  return dispatch => {
    dispatch(requestInfrastructureActualization())
    const data = {id: `${id}`,value: `${newValue}`}
    return reqwest({
      url: 'api/infrastructure/' + id + '/',
      method: 'put',
      data: JSON.stringify(data),
      contentType: 'application/json',
      type: 'json'
    }).then((response) => dispatch(confirmInfrastructureActualization(id, newValue)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

export function addInfrastructureComponent(newValues) {
  return dispatch => {
    dispatch(requestAdditionIntoInfrastructure())
    return reqwest({
      url: 'api/infrastructure/',
      method: 'post',
      data: JSON.stringify(newValues),
      contentType: 'application/json',
      type: 'json'
    }).then((data) => dispatch(confirmAdditionIntoInfrastructure(data)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}
