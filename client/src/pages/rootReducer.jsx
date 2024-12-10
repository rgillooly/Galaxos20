import { combineReducers } from "redux";
import mainReducer from "./mainReducer"; // Make sure this path is correct

const rootReducer = combineReducers({
  main: mainReducer, // Correctly combining the reducer
});

export default rootReducer;
