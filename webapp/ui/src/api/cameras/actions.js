import reqwest from 'reqwest'

export const REQUEST_CAMERAS = 'REQUEST_CAMERAS'
export const RECEIVE_CAMERAS = 'RECEIVE_CAMERAS'
export const INVALIDATE_CAMERAS = 'INVALIDATE_CAMERAS'

export const REQUEST_CAMERA_DELETION = 'REQUEST_CAMERA_DELETION'
export const CONFIRM_CAMERA_DELETION = 'CONFIRM_CAMERA_DELETION'

export const REQUEST_CAMERA_ACTUALIZATION = 'REQUEST_CAMERA_ACTUALIZATION'
export const CONFIRM_CAMERA_ACTUALIZATION = 'CONFIRM_CAMERA_ACTUALIZATION'

export const REQUEST_CAMERA_ADDITION = 'REQUEST_CAMERA_ADDITION'
export const CONFIRM_CAMERA_ADDITION = 'CONFIRM_CAMERA_ADDITION'

export const REQUEST_SET_OR_UPDATE_CAMERA_ZONES = 'REQUEST_SET_OR_UPDATE_CAMERA_ZONES'
export const CONFIRM_SET_OR_UPDATE_CAMERA_ZONES = 'CONFIRM_SET_OR_UPDATE_CAMERA_ZONES'

export const SET_FAILURE_MESSAGE = 'SET_FAILURE_MESSAGE' 
export const FAILURE_MESSAGE = 'Service is currently unavailable. Please try again later!'

function setFailureMessage(message) {
  return {
    type: SET_FAILURE_MESSAGE,
    message
  }
}

function requestSetOrUpdateCameraZones() {
  return {
    type: REQUEST_SET_OR_UPDATE_CAMERA_ZONES
  }
}

function confirmSetOrUpdateCameraZones(id, camera_zones) {
  return {
    type: CONFIRM_SET_OR_UPDATE_CAMERA_ZONES,
    id,
    camera_zones
  }
}

function requestCameraDeletion() {
  return {
    type: REQUEST_CAMERA_DELETION
  }
}

function confirmCameraDeletion(id) {
  return {
    type: CONFIRM_CAMERA_DELETION,
    id
  }
}

function requestCameraActualization() {
  return {
    type: REQUEST_CAMERA_ACTUALIZATION
  }
}

function confirmCameraActualization(id, newValues) {
  return {
    type: CONFIRM_CAMERA_ACTUALIZATION,
    id,
    newValues
  }
}

function requestCameraAddition() {
  return {
    type: REQUEST_CAMERA_ADDITION
  }
}

function confirmCameraAddition(data) {
  return {
    type: CONFIRM_CAMERA_ADDITION,
    data
  }
}

function requestCameras() {
  return {
    type: REQUEST_CAMERAS
  }
}

function receiveCameras(cameras) {
  return {
    type: RECEIVE_CAMERAS,
    entries: cameras
  }
}

export function invalidateCameras() {
  return {
    type: INVALIDATE_CAMERAS
  }
}

function fetchCameras() {
  return dispatch => {
    dispatch(requestCameras())
    return reqwest({
      url: 'api/camera/',
      method: 'get',
      type: 'json'
    }).then((cameras) => dispatch(receiveCameras(cameras)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

function shouldFetchCameras(state) {
  const cameraEntity = state.cameraReducer.cameraEntity
  if (!cameraEntity || cameraEntity.failure) {
    return true
  } else if (cameraEntity.isLoading) {
    return false
  } else {
    return cameraEntity.didInvalidate
  }
}

export function fetchCamerasIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchCameras(getState())) {
      return dispatch(fetchCameras())
    }
  }
}

export function setOrUpdateCameraZones(service_url, id, camera_zones) {
  return dispatch => {
    dispatch(requestSetOrUpdateCameraZones())
    return reqwest({
      url: service_url,
      method: 'post',
      data: JSON.stringify(camera_zones),
      contentType: 'application/json',
      type: 'json'
    }).then((retrieved_zones) => {
       let filtered_zones = retrieved_zones.filter(zone => zone.camera === id)
       dispatch(confirmSetOrUpdateCameraZones(id, filtered_zones))
    }).fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

export function deleteCameraById(id) {
  return dispatch => {
    dispatch(requestCameraDeletion())
    return reqwest({
      url: 'api/camera/' + id + '/',
      method: 'delete',
      type: 'json'
    }).then((response) => dispatch(confirmCameraDeletion(id)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

export function updateCamera(id, newValues) {
  return dispatch => {
    dispatch(requestCameraActualization())
    return reqwest({
      url: 'api/camera/' + id + '/',
      method: 'put',
      data: JSON.stringify(newValues),
      contentType: 'application/json',
      type: 'json'
    }).then((response) => dispatch(confirmCameraActualization(id, newValues)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

export function addCamera(newValues) {
  return dispatch => {
    dispatch(requestCameraAddition())
    return reqwest({
      url: 'api/camera/',
      method: 'post',
      data: JSON.stringify(newValues),
      contentType: 'application/json',
      type: 'json'
    }).then((data) => dispatch(confirmCameraAddition(data)))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}
