import { combineReducers } from "redux";
import charts from "./chartReducer";

const rootReducer = combineReducers({
  charts,
});

export default rootReducer;
