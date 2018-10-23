import { combineReducers } from 'redux'

import { REQUEST_CAMERA_TYPES, RECEIVE_CAMERA_TYPES, INVALIDATE_CAMERA_TYPES, REQUEST_CAMERA_TYPE_DELETION, CONFIRM_CAMERA_TYPE_DELETION, REQUEST_CAMERA_TYPE_ACTUALIZATION, CONFIRM_CAMERA_TYPE_ACTUALIZATION, REQUEST_CAMERA_TYPE_ADDITION, CONFIRM_CAMERA_TYPE_ADDITION, SET_FAILURE_MESSAGE } from './actions'

function cameraTypeEntity(
  state = {
    isAdding: false,
    isLoading: false,
    isUpdating: false,
    isDeleting: false,
    didInvalidate: true,
    entries: [],
    idOfDeletedEntry: null,
    idOfUpdatedEntry: null,
    failure: null,
    csrfToken: null
  },
  action
) {
  switch (action.type) {
    case INVALIDATE_CAMERA_TYPES:
      return Object.assign({}, state, {
        didInvalidate: true,
	failure: null
      })
    case REQUEST_CAMERA_TYPES:
      return Object.assign({}, state, {
        isLoading: true,
	failure: null,
        didInvalidate: false
      })
    case RECEIVE_CAMERA_TYPES:
      return Object.assign({}, state, {
        isAdding: false,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        didInvalidate: false,
        idOfDeletedEntry: null,
        idOfUpdatedEntry: null,
        entries: action.entries,
        csrfToken: action.csrfToken
      })
    case REQUEST_CAMERA_TYPE_DELETION:
      return Object.assign({}, state, {
        isDeleting: true,
        idOfDeletedEntry: null,
	failure: null
      })
    case CONFIRM_CAMERA_TYPE_DELETION:
      return Object.assign({}, state, {
        isDeleting: false,
        idOfDeletedEntry: action.id,
	entries: [...state.entries.filter(cameraType => cameraType.id !== action.id) ]
      })
    case REQUEST_CAMERA_TYPE_ACTUALIZATION:
      return Object.assign({}, state, {
        isUpdating: true,
        idOfUpdatedEntry: null,
	failure: null
      })
    case CONFIRM_CAMERA_TYPE_ACTUALIZATION:
      const newData = [...state.entries]
      const index = newData.findIndex(entry => entry.id === action.id)
      if (index > -1) {
        const entry = newData[index]
        newData.splice(index, 1, {...entry,...action.newValues})
        return Object.assign({}, state, { isUpdating: false, idOfUpdatedEntry: action.id, entries: newData })
      }
      return state
    case REQUEST_CAMERA_TYPE_ADDITION:
      return Object.assign({}, state, {
        isAdding: true,
	failure: null
      })
    case CONFIRM_CAMERA_TYPE_ADDITION:
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
        didInvalidate: false,
        idOfDeletedEntry: null,
        idOfUpdatedEntry: null,
	failure: action.message
      })
    default:
      return state
  }
}

const cameraTypesReducer = combineReducers({
  cameraTypeEntity
})

export default cameraTypesReducer
