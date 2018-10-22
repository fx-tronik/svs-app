import { combineReducers } from 'redux'

import { REQUEST_INFRASTRUCTURE_STATE, RECEIVE_INFRASTRUCTURE_STATE, INVALIDATE_INFRASTRUCTURE_STATE, REQUEST_DELETION_FROM_INFRASTRUCTURE, CONFIRM_DELETION_FROM_INFRASTRUCTURE, REQUEST_INFRASTRUCTURE_ACTUALIZATION, CONFIRM_INFRASTRUCTURE_ACTUALIZATION, REQUEST_ADDITION_INTO_INFRASTRUCTURE, CONFIRM_ADDITION_INTO_INFRASTRUCTURE, SET_FAILURE_MESSAGE } from './actions'

function infrastructureEntity(
  state = {
    isAdding: false,
    isLoading: false,
    isUpdating: false,
    isDeleting: false,
    didInvalidate: true,
    entries: [],
    idOfDeletedEntry: null,
    idOfUpdatedEntry: null,
    failure: null
  },
  action
) {
  switch (action.type) {
    case INVALIDATE_INFRASTRUCTURE_STATE:
      return Object.assign({}, state, {
        didInvalidate: true,
	failure: null
      })
    case REQUEST_INFRASTRUCTURE_STATE:
      return Object.assign({}, state, {
        isLoading: true,
	failure: null,
        didInvalidate: false
      })
    case RECEIVE_INFRASTRUCTURE_STATE:
      return Object.assign({}, state, {
        isAdding: false,
        isLoading: false,
        isUpdating: false,
        isDeleting: false,
        didInvalidate: false,
        idOfDeletedEntry: null,
        idOfUpdatedEntry: null,
        entries: action.entries
      })
    case REQUEST_DELETION_FROM_INFRASTRUCTURE:
      return Object.assign({}, state, {
        isDeleting: true,
        idOfDeletedEntry: null,
	failure: null
      })
    case CONFIRM_DELETION_FROM_INFRASTRUCTURE:
      return Object.assign({}, state, {
        isDeleting: false,
        idOfDeletedEntry: action.id,
	entries: [...state.entries.filter(entry => entry.id !== action.id) ]
      })
    case REQUEST_INFRASTRUCTURE_ACTUALIZATION:
      return Object.assign({}, state, {
        isUpdating: true,
        idOfUpdatedEntry: null,
	failure: null
      })
    case CONFIRM_INFRASTRUCTURE_ACTUALIZATION:
      const newData = [...state.entries]
      const index = newData.findIndex(entry => entry.id === action.id)
      if (index > -1) {
        const entry = newData[index]
        newData.splice(index, 1, {...entry,...action.newValue})
        return Object.assign({}, state, { isUpdating: false, idOfUpdatedEntry: action.id, entries: newData })
      }
      return state
    case REQUEST_ADDITION_INTO_INFRASTRUCTURE:
      return Object.assign({}, state, {
        isAdding: true,
	failure: null
      })
    case CONFIRM_ADDITION_INTO_INFRASTRUCTURE:
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

const infrastructureStateReducer = combineReducers({
  infrastructureEntity
})

export default infrastructureStateReducer
