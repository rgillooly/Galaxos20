import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { debounce } from "lodash";
import PanContainer from "../PanContainer";
import GameTitleEditor from "../GameTitleEditor/GameTitleEditor";
import GameDescriptionEditor from "../GameDescriptionEditor/GameDescriptionEditor";
import AssetMenu from "../AssetMenu/AssetMenu";
import SnapGrid from "../SnapGrid/SnapGrid";
import "./GameContainer.css";

const GameContainer = ({ game = {}, onRename, onDescriptionChange }) => {
  const { _id: gameId = null, gameName = "", gameDescription = "" } = game;
  const [windowTitle, setWindowTitle] = useState(gameName);
  const [gameDescriptionState, setGameDescriptionState] =
    useState(gameDescription);
  const [assetMenus, setAssetMenus] = useState([]);
  const [grids, setGrids] = useState([]);
  const [grid, setGrid] = useState(null);
  const [gridPositions, setGridPositions] = useState([]);
  const [gridBackgroundColor, setGridBackgroundColor] = useState("#f0f0f0");
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [placedAssets, setPlacedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token fetching helper function
  const getAuthToken = () => localStorage.getItem("token");

  // Debounced handlers
  const debouncedChangeHandler = useCallback(
    debounce(setWindowTitle, 1000),
    []
  );

  useEffect(() => {
    if (!gameId) {
      setError("Game ID is required.");
      return;
    }

    setLoading(true);
    const token = getAuthToken();

    if (!token) {
      setError("Token not found. Please log in.");
      setLoading(false);
      return;
    }

    const cancelTokenSource = axios.CancelToken.source();

    // Fetch assetMenus and grids simultaneously
    const fetchAssetMenus = axios.get(
      `http://localhost:3001/api/assetMenus?gameId=${gameId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: cancelTokenSource.token,
      }
    );

    const fetchGrids = axios.get(
      `http://localhost:3001/api/grids?gameId=${gameId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: cancelTokenSource.token,
      }
    );

    // Handle both requests with Promise.all
    Promise.all([fetchAssetMenus, fetchGrids])
      .then(([assetMenusResponse, gridsResponse]) => {
        // Handle Asset Menus Response
        if (Array.isArray(assetMenusResponse.data.assetMenus)) {
          setAssetMenus(assetMenusResponse.data.assetMenus);
        } else {
          console.error(
            "Unexpected structure for asset menus:",
            assetMenusResponse.data
          );
        }

        // Handle Grids Response
        if (Array.isArray(gridsResponse.data.snapGrids)) {
          setGrids(gridsResponse.data.snapGrids);
          setGridPositions(
            new Array(gridsResponse.data.snapGrids.length).fill({ x: 0, y: 0 })
          );
        } else {
          console.error("Unexpected structure for grids:", gridsResponse.data);
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } else {
          setError("Error fetching data.");
          console.error("Failed to fetch data:", err);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup the cancel token when the component unmounts
    return () =>
      cancelTokenSource.cancel("Operation canceled due to component unmount.");
  }, [gameId]); // Fetch again if gameId changes

  // Show error or loading feedback
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleCreateAssetMenu = async () => {
    const newMenu = {
      title: "New Menu",
      position: { top: 100, left: 100 },
      _id: `temp-${Date.now()}`,
      assets: [],
      gameId,
    };

    setAssetMenus((prevMenus) => [...prevMenus, newMenu]);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:3001/api/assetMenus",
        { title: "New Menu", position: newMenu.position, gameId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdMenu = response.data.assetMenu;
      setAssetMenus((prevMenus) =>
        prevMenus.map((menu) => (menu._id === newMenu._id ? createdMenu : menu))
      );
    } catch (error) {
      console.error("Error creating asset menu:", error);
      setAssetMenus((prevMenus) =>
        prevMenus.filter((menu) => menu._id !== newMenu._id)
      );
    }
  };

  const updateMenuPosition = async (menuId, newPosition) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:3001/api/assetMenus/${menuId}/position`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPosition),
      });
    } catch (error) {
      console.error("Error updating menu position:", error);
    }
  };

  const updateGridPosition = async (gridId, newPosition) => {
    try {
      const token = localStorage.getItem("token");

      // Ensure newPosition contains the correct structure
      const response = await fetch(
        `http://localhost:3001/api/grids/${gridId}/position`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ position: newPosition }), // Ensure the structure is { position: { top, left }}
        }
      );

      if (!response.ok) {
        throw new Error("Error updating grid position");
      }

      const updatedGrid = await response.json();
      setGrids((prevGrids) =>
        prevGrids.map((grid) =>
          grid._id === updatedGrid._id ? updatedGrid : grid
        )
      );
    } catch (error) {
      console.error("Error updating grid position:", error);
    }
  };

  const handleCreateSnapGrid = async () => {
    const newGrid = {
      rows: 10,
      columns: 10,
      cellSize: 50,
      gameId,
      _id: `temp-${Date.now()}`, // Creating a temporary ID
    };

    // Optimistically add the new grid to the state
    setGrids((prevGrids) => [...prevGrids, newGrid]);

    try {
      const token = localStorage.getItem("token");

      // Send the grid creation request to the backend
      const response = await axios.post(
        "http://localhost:3001/api/grids/create",
        newGrid,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdGrid = response.data.grid;

      // Replace the temporary grid with the created grid in the state
      setGrids((prevGrids) =>
        prevGrids.map((grid) => (grid._id === newGrid._id ? createdGrid : grid))
      );
    } catch (error) {
      console.error("Error creating snap grid:", error);

      // If there's an error, remove the temporarily created grid from the state
      setGrids((prevGrids) =>
        prevGrids.filter((grid) => grid._id !== newGrid._id)
      );
    }
  };

  // Handle the dropped asset and update its position in the grid or other state
  const handleAssetDrop = (asset, position) => {
    // You can store the dropped position and asset in the state
    const updatedAssets = [...placedAssets, { ...asset, position }];
    setPlacedAssets(updatedAssets);
    updateGridPosition(asset.gridId, position);
  };

  const fetchAssets = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://localhost:3001/api/assets?gameId=${gameId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        return response.data.assets; // Return the fetched assets
      } else {
        console.error("No assets found for this game.");
        return [];
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Assets not found for this game:", error);
      } else {
        console.error("Error fetching assets:", error);
      }
      return []; // Return an empty array if no assets are found
    }
  };

  return (
    <div className="game-container">
      <div>
        <GameTitleEditor
          gameName={windowTitle}
          onChange={debouncedChangeHandler}
        />
        <GameDescriptionEditor
          gameDescription={gameDescriptionState}
          onChange={debouncedChangeHandler}
        />
      </div>

      <button onClick={handleCreateAssetMenu}>Create Asset Menu</button>
      <button onClick={handleCreateSnapGrid}>Create Snap Grid</button>

      <PanContainer>
        <div style={{ width: "800px", height: "600px", position: "relative" }}>
          {grids && grids.length > 0 ? (
            grids.map((grid) => (
              <SnapGrid
                key={grid._id}
                _id={grid._id}
                grid={grid}
                rows={grid.rows}
                columns={grid.columns}
                cellSize={grid.cellSize}
                setIsDraggingAsset={setIsDraggingAsset}
                assets={placedAssets}
                position={grid.position}
                backgroundColor={gridBackgroundColor}
                updatePosition={updateGridPosition}
                // onPositionChange={(newPosition) =>
                //   handlePositionChange(newPosition)
                // }
              />
            ))
          ) : (
            <p>Loading grids...</p>
          )}

          {assetMenus &&
            assetMenus.length > 0 &&
            assetMenus.map((menu) => (
              <AssetMenu
                key={menu._id}
                _id={menu._id}
                menu={menu}
                title={menu.title}
                position={menu.position}
                placedAssets={placedAssets}
                onAssetPlaced={handleAssetDrop}
                fetchAssets={fetchAssets} // Pass fetchAssets as a prop
                updatePosition={updateMenuPosition}
                setIsDraggingAsset={setIsDraggingAsset}
              />
            ))}
        </div>
      </PanContainer>
    </div>
  );
};

GameContainer.propTypes = {
  game: PropTypes.shape({
    _id: PropTypes.string,
    gameName: PropTypes.string,
    gameDescription: PropTypes.string,
  }).isRequired,
  onRename: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
};

export default GameContainer;
