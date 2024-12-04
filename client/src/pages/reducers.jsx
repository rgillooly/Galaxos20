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
          // Check for duplicates before adding
          const existingGrid = state.main.grids.find(grid => grid._id === action.payload._id);
          if (existingGrid) {
            console.warn("Grid with this ID already exists.");
            return state;
          }
          return {
            ...state,
            main: {
              ...state.main,
              grids: [...state.main.grids, action.payload],
            },
          };
        case 'assetMenu':
          // Check for duplicates before adding
          const existingAssetMenu = state.main.assetMenus.find(menu => menu._id === action.payload._id);
          if (existingAssetMenu) {
            console.warn("Asset Menu with this ID already exists.");
            return state;
          }
          return {
            ...state,
            main: {
              ...state.main,
              assetMenus: [...state.main.assetMenus, action.payload],
            },
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

      // Check if the asset menu already exists in state
      const existingAssetMenuForCreate = state.main.assetMenus.find(menu => menu._id === action.payload._id);
      if (existingAssetMenuForCreate) {
        console.warn("Asset Menu with this ID already exists.");
        return state;
      }

      return {
        ...state,
        main: {
          ...state.main,
          assetMenus: [...state.main.assetMenus, action.payload],
        },
      };

    case UPDATE_ITEM:
      if (!action.payload || !action.payload.items || !Array.isArray(action.payload.items)) {
        console.error("Invalid UPDATE_ITEM action payload", action.payload);
        return state; // Return state without changes if payload is invalid
      }

      // Dynamically update based on the type of item
      switch (action.payload.type) {
        case "assetMenus":
          return {
            ...state,
            main: {
              ...state.main,
              assetMenus: action.payload.items, // Update assetMenus in state with new items
            },
          };

        case "grids":
          return {
            ...state,
            main: {
              ...state.main,
              grids: action.payload.items, // Update grids in state with new items
            },
          };

        default:
          console.error("Unknown type in UPDATE_ITEM", action.payload.type);
          return state;
      }

    case ADD_GRID:
      if (!action.payload) {
        console.error("Invalid ADD_GRID action payload", action.payload);
        return state;
      }

      // Check for duplicates before adding a grid
      const existingGridForAdd = state.main.grids.find(grid => grid._id === action.payload._id);
      if (existingGridForAdd) {
        console.warn("Grid with this ID already exists.");
        return state;
      }

      return {
        ...state,
        main: {
          ...state.main,
          grids: [...state.main.grids, action.payload],
        },
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

export const updateItem = (type, items) => ({
  type: UPDATE_ITEM,
  payload: { type, items },
});

export const addGrid = (grid) => ({
  type: ADD_GRID,
  payload: grid,
});
