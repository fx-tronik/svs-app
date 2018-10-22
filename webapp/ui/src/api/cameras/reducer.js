import { combineReducers } from 'redux'

import { REQUEST_CAMERAS, RECEIVE_CAMERAS, INVALIDATE_CAMERAS, REQUEST_CAMERA_DELETION, CONFIRM_CAMERA_DELETION, REQUEST_CAMERA_ACTUALIZATION, CONFIRM_CAMERA_ACTUALIZATION, REQUEST_CAMERA_ADDITION, CONFIRM_CAMERA_ADDITION, SET_FAILURE_MESSAGE, REQUEST_SET_OR_UPDATE_CAMERA_ZONES, CONFIRM_SET_OR_UPDATE_CAMERA_ZONES } from './actions'

function cameraEntity(
  state = {
    isAdding: false,
    isLoading: false,
    isUpdating: false,
    isDeleting: false,
    areCameraZonesSettingOrUpdating: false,
    didInvalidate: true,
    entries: [],
    failure: null
  },
  action
) {
  switch (action.type) {
    case INVALIDATE_CAMERAS:
      return Object.assign({}, state, {
        didInvalidate: true,
	failure: null
      })
    case REQUEST_CAMERAS:
      return Object.assign({}, state, {
        isLoading: true,
	failure: null,
        didInvalidate: false
      })
    case RECEIVE_CAMERAS:
      return Object.assign({}, state, {
        isAdding: false,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        areCameraZonesSettingOrUpdating: false,
        didInvalidate: false,
        entries: action.entries
      })
    case REQUEST_SET_OR_UPDATE_CAMERA_ZONES:
      return Object.assign({}, state, {
        areCameraZonesSettingOrUpdating: true,
	failure: null
      })
    case CONFIRM_SET_OR_UPDATE_CAMERA_ZONES:
      const newCamera = [...state.entries]
      const camera_index = newCamera.findIndex(entry => entry.id === action.id)
      if (camera_index > -1) {
        const entry = newCamera[camera_index]
        const updatedEntry = Object.assign({}, entry, { camera_zones: action.camera_zones } )
        newCamera.splice(camera_index, 1, {...entry,...updatedEntry})
        return Object.assign({}, state, { areCameraZonesSettingOrUpdating: false, entries: newCamera })
      }
      return state
    case REQUEST_CAMERA_DELETION:
      return Object.assign({}, state, {
        isDeleting: true,
	failure: null
      })
    case CONFIRM_CAMERA_DELETION:
      return Object.assign({}, state, {
        isDeleting: false,
	entries: [...state.entries.filter(camera => camera.id !== action.id) ]
      })
    case REQUEST_CAMERA_ACTUALIZATION:
      return Object.assign({}, state, {
        isUpdating: true,
	failure: null
      })
    case CONFIRM_CAMERA_ACTUALIZATION:
      const newData = [...state.entries]
      const index = newData.findIndex(entry => entry.id === action.id)
      if (index > -1) {
        const entry = newData[index]
        newData.splice(index, 1, {...entry,...action.newValues})
        return Object.assign({}, state, { isUpdating: false, entries: newData })
      }
      return state
    case REQUEST_CAMERA_ADDITION:
      return Object.assign({}, state, {
        isAdding: true,
	failure: null
      })
    case CONFIRM_CAMERA_ADDITION:
      return Object.assign({}, state, {
        isAdding: false,
        entries: [ ...state.entries, action.data ]
      })
    case SET_FAILURE_MESSAGE:
      return Object.assign({}, state, {
        isAdding: false,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        areCameraZonesSettingOrUpdating: false,
        didInvalidate: false,
	failure: action.message
      })
    default:
      return state
  }
}

const camerasReducer = combineReducers({
  cameraEntity
})

export default camerasReducer
