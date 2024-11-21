import { createStore, combineReducers } from "redux";
import reducer from "./reducers"; // Import the reducer

const rootReducer = combineReducers({
  main: reducer, // Ensure 'main' matches the state used in useSelector
});

const store = createStore(rootReducer);

export default store;
