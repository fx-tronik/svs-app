import {combineReducers} from "redux";

import {reduceReducers} from "../../common/utils/reducerUtils";

import cameraTypesReducer from "../../api/cameraTypes/reducer";
import camerasReducer from "../../api/cameras/reducer";
import historyOfAlertsReducer from "../../api/alertHistory/reducer";
import infrastructureStateReducer from "../../api/infrastructure/reducer";

const combinedReducer = combineReducers({
    cameraTypeReducer: cameraTypesReducer,
    cameraReducer: camerasReducer,
    alertHistoryReducer: historyOfAlertsReducer,
    infrastructureReducer: infrastructureStateReducer
});

const rootReducer = reduceReducers(
    combinedReducer
);

export default rootReducer;
