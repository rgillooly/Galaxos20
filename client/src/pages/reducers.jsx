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

export default function reducers(state = initialState, action) {
  switch (action.type) {
    case ADD_ITEM:
      // Validate ADD_ITEM action payload
      if (!action.payload || !action.payload.type || !action.payload.item) {
        console.error("Invalid ADD_ITEM action payload", action.payload);
        return state;
      }

      switch (action.payload.type) {
        case "grid":
          // Adding a new grid
          return {
            ...state,
            main: {
              ...state.main,
              grids: [...state.main.grids, action.payload.item],
            },
          };

        case "assetMenu":
          // Adding a new asset menu
          return {
            ...state,
            main: {
              ...state.main,
              assetMenus: [...state.main.assetMenus, action.payload.item],
            },
          };

        default:
          console.error("Unknown item type in ADD_ITEM", action.payload.type);
          return state;
      }

    case "UPDATE_ITEM":
      if (
        !action.payload ||
        !Array.isArray(action.payload.items) ||
        action.payload.items.length === 0
      ) {
        console.error("Invalid UPDATE_ITEM action payload", action.payload);
        return state;
      }

      // Update asset menu items with the new position
      return {
        ...state,
        main: {
          ...state.main,
          assetMenus: state.main.assetMenus.map((menu) =>
            action.payload.items.some((item) => item._id === menu._id)
              ? {
                  ...menu,
                  ...action.payload.items.find((item) => item._id === menu._id),
                }
              : menu
          ),
        },
      };

    case "SET_ASSET_DATA":
      // Validate SET_ASSET_DATA payload
      if (action.payload && Array.isArray(action.payload.assetMenus)) {
        if (action.payload.assetMenus.length === 0) {
          console.warn("No asset menus available.");
          return {
            ...state,
            main: {
              ...state.main,
              assetMenus: [], // Ensure that assetMenus is empty if no data is found
            },
          };
        }

        return {
          ...state,
          main: {
            ...state.main,
            assetMenus: action.payload.assetMenus, // Corrected to update main.assetMenus
          },
        };
      } else {
        console.error("Invalid SET_ASSET_DATA payload:", action.payload);
        return state;
      }

    // Other cases can go here (if needed)
    default:
      return state;
  }
}

export const addGrid = (grid) => ({
  type: ADD_GRID,
  payload: grid,
});

export const createAssetMenu = (assetMenu) => ({
  type: ADD_ITEM,
  payload: {
    type: "assetMenu",
    item: assetMenu, // Corrected to 'item'
  },
});

export const addItem = (item) => ({
  type: ADD_ITEM,
  payload: {
    type: item.type, // Make sure item has a valid type (grid or assetMenu)
    item: item,
  },
});

export const updateItem = ({ type, items }) => ({
  type: UPDATE_ITEM,
  payload: { type, items },
});
