import { combineReducers } from 'redux'

import { REQUEST_EMPLOYEES, RECEIVE_EMPLOYEES, INVALIDATE_EMPLOYEES, REQUEST_EMPLOYEE_DELETION, CONFIRM_EMPLOYEE_DELETION, REQUEST_EMPLOYEE_ACTUALIZATION, CONFIRM_EMPLOYEE_ACTUALIZATION, REQUEST_EMPLOYEE_ADDITION, CONFIRM_EMPLOYEE_ADDITION, SET_FAILURE_MESSAGE } from './actions'

function employeeEntity(
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
    case INVALIDATE_EMPLOYEES:
      return Object.assign({}, state, {
        didInvalidate: true,
	failure: null
      })
    case REQUEST_EMPLOYEES:
      return Object.assign({}, state, {
        isLoading: true,
	failure: null,
        didInvalidate: false
      })
    case RECEIVE_EMPLOYEES:
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
    case REQUEST_EMPLOYEE_DELETION:
      return Object.assign({}, state, {
        isDeleting: true,
        idOfDeletedEntry: null,
	failure: null
      })
    case CONFIRM_EMPLOYEE_DELETION:
      return Object.assign({}, state, {
        isDeleting: false,
        idOfDeletedEntry: action.id,
	entries: [...state.entries.filter(employee => employee.id !== action.id) ]
      })
    case REQUEST_EMPLOYEE_ACTUALIZATION:
      return Object.assign({}, state, {
        isUpdating: true,
        idOfUpdatedEntry: null,
	failure: null
      })
    case CONFIRM_EMPLOYEE_ACTUALIZATION:
      const newData = [...state.entries]
      const index = newData.findIndex(entry => entry.id === action.id)
      if (index > -1) {
        const entry = newData[index]
        newData.splice(index, 1, {...entry,...action.newValues})
        return Object.assign({}, state, { isUpdating: false, idOfUpdatedEntry: action.id, entries: newData })
      }
      return state
    case REQUEST_EMPLOYEE_ADDITION:
      return Object.assign({}, state, {
        isAdding: true,
	failure: null
      })
    case CONFIRM_EMPLOYEE_ADDITION:
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

const employeesReducer = combineReducers({
  employeeEntity
})

export default employeesReducer
