// Initial state for the reducer
const initialState = {
  assetMenus: [], // Array to store asset menus
  grids: [], // Array for snap grids
};

// Action Types
export const ADD_ITEM = "ADD_ITEM";
export const UPDATE_ITEM = "UPDATE_ITEM";
export const ADD_GRID = "ADD_GRID";
export const CREATE_ASSET_MENU = "CREATE_ASSET_MENU";

// Reducer Function
export default function reducers(state = initialState, action) {
  switch (action.type) {
    case ADD_ITEM:
      return {
        ...state,
        items: [...state.items, action.payload], // Adding a new item (this needs `items` in state)
      };

    case CREATE_ASSET_MENU:
      return {
        ...state,
        assetMenus: [...state.assetMenus, action.payload], // Add the new asset menu to assetMenus
      };

    case UPDATE_ITEM:
      if (action.payload.type === "assetMenus") {
        return {
          ...state,
          assetMenus: action.payload.items, // Update assetMenus in state with new items
        };
      }
      return state;

    case ADD_GRID:
      return {
        ...state,
        grids: [...state.grids, action.payload], // Adding a new grid
      };

    default:
      return state; // Return the current state if action type doesn't match
  }
}

// Action Creators

export const createAssetMenu = (assetMenu) => ({
  type: CREATE_ASSET_MENU,
  payload: assetMenu,
});

export const addItem = (item) => ({
  type: ADD_ITEM,
  payload: item,
});

export const updateItem = (items) => ({
  type: UPDATE_ITEM,
  payload: items,
});

export const addGrid = (grid) => ({
  type: ADD_GRID,
  payload: grid,
});
