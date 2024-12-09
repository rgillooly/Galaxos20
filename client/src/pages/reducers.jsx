import {
  ADD_ITEM,
  UPDATE_ITEM,
  ADD_GRID,
  CREATE_ASSET_MENU,
} from "./actionTypes";

const initialState = {
  main: {
    assetMenus: [], // Default value to ensure this always exists
    grids: [],
  },
};

// Reducer function
export default function reducers(state = initialState, action) {
  switch (action.type) {
    case ADD_ITEM:
      if (!action.payload || !action.payload.type) {
        console.error("Invalid ADD_ITEM action payload", action.payload);
        return state;
      }

      switch (action.payload.type) {
        case "grid":
          return {
            ...state,
            main: {
              ...state.main,
              grids: [...state.main.grids, action.payload.item], // Adds new grid
            },
          };
        case "assetMenu":
          return {
            ...state,
            main: {
              ...state.main,
              assetMenus: [...state.main.assetMenus, action.payload.item], // Adds new asset menu
            },
          };
        default:
          console.error("Unknown item type in ADD_ITEM", action.payload.type);
          return state;
      }

    case UPDATE_ITEM:
      if (action.payload.type === "assetMenus") {
        return {
          ...state,
          main: {
            ...state.main,
            assetMenus: action.payload.items, // Updates assetMenus
          },
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
        main: {
          ...state.main,
          grids: [...state.main.grids, action.payload], // Adds new grid
        },
      };

    case CREATE_ASSET_MENU:
      return {
        ...state,
        main: {
          ...state.main,
          assetMenus: [...state.main.assetMenus, action.payload], // Adds new asset menu
        },
      };

    // You can combine SET_ASSET_DATA with one case
    case "SET_ASSET_DATA":
      return {
        ...state,
        main: {
          ...state.main,
          assetMenus: action.payload, // Store fetched asset data
        },
      };

    default:
      return state;
  }
}

// Action Creators
export const addGrid = (grid) => ({
  type: ADD_GRID,
  payload: grid,
});

export const createAssetMenu = (assetMenu) => ({
  type: ADD_ITEM, // Same as ADD_ITEM but only for assetMenus
  payload: {
    type: "assetMenu",
    item: assetMenu, // Corrected to 'item'
  },
});

export const addItem = (item) => ({
  type: ADD_ITEM,
  payload: item,
});

export const updateItem = ({ type, items }) => ({
  type: UPDATE_ITEM,
  payload: { type, items },
});
