import reqwest from 'reqwest'
import Cookies from 'js-cookie'

export const REQUEST_EMPLOYEES = 'REQUEST_EMPLOYEES'
export const RECEIVE_EMPLOYEES = 'RECEIVE_EMPLOYEES'
export const INVALIDATE_EMPLOYEES = 'INVALIDATE_EMPLOYEES'

export const REQUEST_EMPLOYEE_DELETION = 'REQUEST_EMPLOYEE_DELETION'
export const CONFIRM_EMPLOYEE_DELETION = 'CONFIRM_EMPLOYEE_DELETION'

export const REQUEST_EMPLOYEE_ACTUALIZATION = 'REQUEST_EMPLOYEE_ACTUALIZATION'
export const CONFIRM_EMPLOYEE_ACTUALIZATION = 'CONFIRM_EMPLOYEE_ACTUALIZATION'

export const REQUEST_EMPLOYEE_ADDITION = 'REQUEST_EMPLOYEE_ADDITION'
export const CONFIRM_EMPLOYEE_ADDITION = 'CONFIRM_EMPLOYEE_ADDITION'

export const SET_FAILURE_MESSAGE = 'SET_FAILURE_MESSAGE'
export const FAILURE_MESSAGE = 'Service is currently unavailable. Please try again later!'

function setFailureMessage(message) {
  return {
    type: SET_FAILURE_MESSAGE,
    message
  }
}

function requestEmployeesDeletion() {
  return {
    type: REQUEST_EMPLOYEE_DELETION
  }
}

function confirmEmployeesDeletion(id) {
  return {
    type: CONFIRM_EMPLOYEE_DELETION,
    id
  }
}

function requestEmployeesActualization() {
  return {
    type: REQUEST_EMPLOYEE_ACTUALIZATION
  }
}

function confirmEmployeesActualization(id, newValues) {
  return {
    type: CONFIRM_EMPLOYEE_ACTUALIZATION,
    id,
    newValues
  }
}

function requestEmployeesAddition() {
  return {
    type: REQUEST_EMPLOYEE_ADDITION
  }
}

function confirmEmployeesAddition(data) {
  return {
    type: CONFIRM_EMPLOYEE_ADDITION,
    data
  }
}

function requestEmployees() {
  return {
    type: REQUEST_EMPLOYEES
  }
}

function receiveEmployees(employees, token) {
  return {
    type: RECEIVE_EMPLOYEES,
    entries: employees,
    csrfToken: token
  }
}

export function invalidateEmployees() {
  return {
    type: INVALIDATE_EMPLOYEES
  }
}

function fetchEmployees() {
  return dispatch => {
    dispatch(requestEmployees())
    return reqwest({
      url: 'api/employee/',
      method: 'get',
      type: 'json'
    }).then((employees) => dispatch(receiveEmployees(employees, Cookies.get('csrftoken'))))
      .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
  }
}

function shouldFetchEmployees(state) {
  const employeeEntity = state.employeeReducer.employeeEntity
  if (!employeeEntity || employeeEntity.failure) {
    return true
  } else if (employeeEntity.isLoading) {
    return false
  } else {
    return employeeEntity.didInvalidate
  }
}

export function fetchEmployeesIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchEmployees(getState())) {
      return dispatch(fetchEmployees())
    }
  }
}

export function deleteEmployeeById(id) {
  return (dispatch, getState) => {
    const employeeEntity = getState().employeeReducer.employeeEntity
    if (employeeEntity) {
      dispatch(requestEmployeesDeletion())
      return reqwest({
        url: 'api/employee/' + id + '/',
        method: 'delete',
        type: 'json',
        headers: {
          'X-CSRFToken': employeeEntity.csrfToken
        }
      }).then((response) => dispatch(confirmEmployeesDeletion(id)))
        .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
    } else dispatch(setFailureMessage(FAILURE_MESSAGE))
  }
}

export function updateEmployee(id, newValues) {
  return (dispatch, getState) => {
    const employeeEntity = getState().employeeReducer.employeeEntity
    if (employeeEntity) {
      dispatch(requestEmployeesActualization())
      return reqwest({
        url: 'api/employee/' + id + '/',
        method: 'put',
        data: JSON.stringify(newValues),
        contentType: 'application/json',
        type: 'json',
        headers: {
          'X-CSRFToken': employeeEntity.csrfToken
        }
      }).then((response) => dispatch(confirmEmployeesActualization(id, newValues)))
        .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
    } else dispatch(setFailureMessage(FAILURE_MESSAGE))
  }
}

export function addEmployee(newValues) {
  return (dispatch, getState) => {
    const employeeEntity = getState().employeeReducer.employeeEntity
    if (employeeEntity) {
      dispatch(requestEmployeesAddition())
      return reqwest({
        url: 'api/employee/',
        method: 'post',
        data: JSON.stringify(newValues),
        contentType: 'application/json',
        type: 'json',
        headers: {
          'X-CSRFToken': employeeEntity.csrfToken
        }
      }).then((data) => dispatch(confirmEmployeesAddition(data)))
        .fail((error) => dispatch(setFailureMessage(FAILURE_MESSAGE)))
    } else dispatch(setFailureMessage(FAILURE_MESSAGE))
  }
}
