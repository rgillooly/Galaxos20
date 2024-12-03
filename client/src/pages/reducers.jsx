// Initial state for the reducer
const initialState = {
  main: {
    assetMenus: [],
    grids: [],
  },
};

// Action Types
export const ADD_ITEM = "ADD_ITEM";
export const UPDATE_ITEM = "UPDATE_ITEM";
export const ADD_GRID = "ADD_GRID";
export const CREATE_ASSET_MENU = "CREATE_ASSET_MENU";

// Reducer Function
// Reducer Function
export default function reducers(state = initialState, action) {
  switch (action.type) {
    case ADD_ITEM:
      if (!action.payload || !action.payload.type) {
        console.error("Invalid ADD_ITEM action payload", action.payload);
        return state;
      }

      // Handling dynamic action types based on payload type
      switch (action.payload.type) {
        case 'grid':
          return {
            ...state,
            grids: [...state.grids, action.payload],
          };
        case 'assetMenu':
          return {
            ...state,
            assetMenus: [...state.assetMenus, action.payload],
          };
        default:
          console.error("Unknown item type in ADD_ITEM", action.payload.type);
          return state;
      }

    case CREATE_ASSET_MENU:
      if (!action.payload) {
        console.error("Invalid CREATE_ASSET_MENU action payload", action.payload);
        return state;
      }
      return {
        ...state,
        assetMenus: [...state.assetMenus, action.payload],
      };

      case UPDATE_ITEM:
        if (!action.payload || !Array.isArray(action.payload.items)) {
          console.error("Invalid UPDATE_ITEM action payload", action.payload);
          return state; // Return state without changes if payload is invalid
        }
      
        if (action.payload.type === "assetMenus") {
          return {
            ...state,
            assetMenus: action.payload.items, // Update assetMenus in state with new items
          };
        }
        return state;      

    case ADD_GRID:
      if (!action.payload) {
        console.error("Invalid ADD_GRID action payload", action.payload);
        return state;
      }
      return {
        ...state,
        grids: [...state.grids, action.payload],
      };

    default:
      return state;
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
