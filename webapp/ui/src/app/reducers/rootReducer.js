import {combineReducers} from "redux";

import {reduceReducers} from "../../common/utils/reducerUtils";

import cameraTypesReducer from "../../api/cameraTypes/reducer";
import camerasReducer from "../../api/cameras/reducer";
import historyOfAlertsReducer from "../../api/alertHistory/reducer";
import infrastructureStateReducer from "../../api/infrastructure/reducer";
import employeesReducer from "../../api/employees/reducer";

const combinedReducer = combineReducers({
    cameraTypeReducer: cameraTypesReducer,
    cameraReducer: camerasReducer,
    alertHistoryReducer: historyOfAlertsReducer,
    infrastructureReducer: infrastructureStateReducer,
    employeeReducer: employeesReducer
});

const rootReducer = reduceReducers(
    combinedReducer
);

export default rootReducer;
