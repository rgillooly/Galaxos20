// actionTypes.js or inside the same reducers.js file
export const ADD_ITEM = "ADD_ITEM";
export const UPDATE_ITEM = "UPDATE_ITEM";
export const ADD_GRID = "ADD_GRID";
export const CREATE_ASSET_MENU = "CREATE_ASSET_MENU";
export const fetchAssetData = () => {
  return (dispatch) => {
    // Simulate an API call or fetch data
    fetch("/api/assets")
      .then((response) => response.json())
      .then((data) => dispatch({ type: "SET_ASSET_DATA", payload: data }))
      .catch((error) => console.error("Error fetching asset data:", error));
  };
};
