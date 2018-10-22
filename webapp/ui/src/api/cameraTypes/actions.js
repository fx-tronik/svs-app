import reqwest from 'reqwest'

export const REQUEST_CAMERA_TYPES = 'REQUEST_CAMERA_TYPES'
export const RECEIVE_CAMERA_TYPES = 'RECEIVE_CAMERA_TYPES'
export const INVALIDATE_CAMERA_TYPES = 'INVALIDATE_CAMERA_TYPES'

export const REQUEST_CAMERA_TYPE_DELETION = 'REQUEST_CAMERA_TYPE_DELETION'
export const CONFIRM_CAMERA_TYPE_DELETION = 'CONFIRM_CAMERA_TYPE_DELETION'

export const REQUEST_CAMERA_TYPE_ACTUALIZATION = 'REQUEST_CAMERA_TYPE_ACTUALIZATION'
export const CONFIRM_CAMERA_TYPE_ACTUALIZATION = 'CONFIRM_CAMERA_TYPE_ACTUALIZATION'

export const REQUEST_CAMERA_TYPE_ADDITION = 'REQUEST_CAMERA_TYPE_ADDITION'
export const CONFIRM_CAMERA_TYPE_ADDITION = 'CONFIRM_CAMERA_TYPE_ADDITION'

export const SET_FAILURE_MESSAGE = 'SET_FAILURE_MESSAGE' 
export const FAILURE_MESSAGE = 'Service is currently unavailable. Please try again later!'

function setFailureMessage(message) {
  return {
    type: SET_FAILURE_MESSAGE,
    message
  }
}

function requestCameraTypeDeletion() {
  return {
    type: REQUEST_CAMERA_TYPE_DELETION
  }
}

function confirmCameraTypeDeletion(id) {
  return {
    type: CONFIRM_CAMERA_TYPE_DELETION,
    id
  }
}

function requestCameraTypeActualization() {
  return {
    type: REQUEST_CAMERA_TYPE_ACTUALIZATION
  }
}

function confirmCameraTypeActualization(id, newValues) {
  return {
    type: CONFIRM_CAMERA_TYPE_ACTUALIZATION,
    id,
    newValues
  }
}

function requestCameraTypeAddition() {
  return {
    type: REQUEST_CAMERA_TYPE_ADDITION
  }
}

function confirmCameraTypeAddition(data) {
  return {
    type: CONFIRM_CAMERA_TYPE_ADDITION,
    data
  }
}

function requestCameraTypes() {
  return {
    type: REQUEST_CAMERA_TYPES
  }
}

function receiveCameraTypes(cameraTypes) {
  return {
    type: RECEIVE_CAMERA_TYPES,
    entries: cameraTypes
  }
}

export function invalidateCameraTypes() {
  return {
    type: INVALIDATE_CAMERA_TYPES
  }
}

function fetchCameraTypes() {
  return dispatch => {
    dispatch(requestCameraTypes())
    return reqwest({
      url: 'api/camera-type/',
      method: 'get',
      type: 'json'
    }).then((cameraTypes) => dispatch(receiveCameraTypes(cameraTypes)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

function shouldFetchCameraTypes(state) {
  const cameraTypeEntity = state.cameraTypeReducer.cameraTypeEntity
  if (!cameraTypeEntity || cameraTypeEntity.failure) {
    return true
  } else if (cameraTypeEntity.isLoading) {
    return false
  } else {
    return cameraTypeEntity.didInvalidate
  }
}

export function fetchCameraTypesIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchCameraTypes(getState())) {
      return dispatch(fetchCameraTypes())
    }
  }
}

export function deleteCameraTypeById(id) {
  return dispatch => {
    dispatch(requestCameraTypeDeletion())
    return reqwest({
      url: 'api/camera-type/' + id + '/',
      method: 'delete',
      type: 'json'
    }).then((response) => dispatch(confirmCameraTypeDeletion(id)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

export function updateCameraType(id, newValues) {
  return dispatch => {
    dispatch(requestCameraTypeActualization())
    return reqwest({
      url: 'api/camera-type/' + id + '/',
      method: 'put',
      data: JSON.stringify(newValues),
      contentType: 'application/json',
      type: 'json'
    }).then((response) => dispatch(confirmCameraTypeActualization(id, newValues)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

export function addCameraType(newValues) {
  return dispatch => {
    dispatch(requestCameraTypeAddition())
    return reqwest({
      url: 'api/camera-type/',
      method: 'post',
      data: JSON.stringify(newValues),
      contentType: 'application/json',
      type: 'json'
    }).then((data) => dispatch(confirmCameraTypeAddition(data)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}
