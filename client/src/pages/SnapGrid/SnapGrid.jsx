import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import "react-grid-layout/css/styles.css";

const SnapGrid = ({
  grid,
  rows,
  columns,
  cellSize,
  initialPosition,
  onAssetPlaced,
  setIsDraggingAsset,
}) => {
  const [assets, setAssets] = useState([]);
  const [placedAssets, setPlacedAssets] = useState([]); // Store multiple assets
  const [draggingAsset, setDraggingAsset] = useState(null); // Currently dragged asset
  const [position, setPosition] = useState({ top: 100, left: 100 }); // Position of the grid itself
  const [hasLoadedPosition, setHasLoadedPosition] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const prevPosition = useRef(position); // Store previous position

  // Track the initial position of the grid
  const initialGridPosition = useRef({ top: 0, left: 0 });

  // Ensure grid is defined before loading its position
  useEffect(() => {
    if (!grid) {
      console.error("Grid is not defined.");
      return; // Exit early if grid is not available
    }

    if (hasLoadedPosition) return;

    const loadGrid = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. User is not authenticated.");
          return;
        }

        const response = await fetch(
          `http://localhost:3001/api/grids/${grid._id}`, // Use grid._id safely
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          console.error("Unauthorized: Token is invalid or expired.");
          return;
        }

        const data = await response.json();

        if (data.grid?.position) {
          const newPosition = {
            top: Number(data.grid.position.top) || 100,
            left: Number(data.grid.position.left) || 100,
          };

          setPosition(newPosition);
          initialGridPosition.current = newPosition;
          prevPosition.current = newPosition;
          setHasLoadedPosition(true);
        }
      } catch (error) {
        console.error("Error loading grid:", error);
      }
    };

    loadGrid();
  }, [grid, hasLoadedPosition]);

  // Handle the drag start event
  const handleStart = useCallback(
    (e, data) => {
      if (typeof setIsDraggingAsset === "function") {
        setIsDraggingAsset(true); // Call setIsDraggingAsset when drag starts
      }
    },
    [setIsDraggingAsset]
  );

  // Handle the drag movement
  const handleDrag = useCallback((e, data) => {
    const newPosition = {
      top: initialGridPosition.current.top + data.y,
      left: initialGridPosition.current.left + data.x,
    };

    setPosition(newPosition);
    prevPosition.current = newPosition;
  }, []);

  const handleStop = useCallback(
    async (e, data) => {
      const newPosition = {
        top: prevPosition.current.top + data.y,
        left: prevPosition.current.left + data.x,
      };

      setPosition(newPosition);
      initialGridPosition.current = newPosition;

      if (onAssetPlaced) {
        onAssetPlaced(newPosition);
      }

      // Add more logging here to understand what's happening
      console.log("Grid in handleStop:", grid);
      if (!grid || !grid._id) {
        console.error("Grid ID is missing, cannot save position.");
        return;
      }

      // Save the new position to the database
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. User is not authenticated.");
          return;
        }

        const response = await fetch(
          `http://localhost:3001/api/grids/${grid._id}/position`, // Ensure grid._id is valid
          {
            method: "PUT", // Use PUT or PATCH to update the grid
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              position: newPosition, // Send the updated position to the server
            }),
          }
        );

        if (response.ok) {
          console.log("Grid position updated successfully");
        } else {
          console.error("Failed to update grid position");
        }
      } catch (error) {
        console.error("Error saving grid position:", error);
      }

      setIsDraggingAsset(false);
    },
    [onAssetPlaced, setIsDraggingAsset, grid] // Ensure grid is included in dependency array
  );

  return (
    <Draggable
      handle=".drag-handle"
      onStop={handleStop}
      onStart={handleStart}
      onDrag={handleDrag}
      position={{ x: dragOffset.current.x, y: dragOffset.current.y }}
    >
      <div
        style={{
          position: "relative",
          top: `${position.top + dragOffset.current.y}px`,
          left: `${position.left + dragOffset.current.x}px`,
          width: "300px",
          height: "500px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <div
          className="drag-handle"
          style={{
            backgroundColor: "#ddd",
            padding: "8px",
            cursor: "grab",
            textAlign: "center",
            borderRadius: "6px 6px 0 0",
          }}
        ></div>
        {/* Grid Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
            position: "relative",
            cursor: "pointer",
            background: "#f0f0f0",
            border: "1px solid #ccc",
          }}
        >
          {assets.map((asset) => (
            <Draggable
              key={asset.id}
              defaultPosition={asset.position}
              onStop={(e, data) => handleStop(e, data, asset)}
              onStart={() => handleDragStart(asset)}
              bounds="parent"
            >
              <div
                style={{
                  position: "absolute",
                  left: asset.position.x,
                  top: asset.position.y,
                  width: cellSize,
                  height: cellSize,
                }}
              >
                <img
                  src={asset.imageUrl}
                  alt={asset.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </Draggable>
          ))}
        </div>
      </div>
    </Draggable>
  );
};

SnapGrid.propTypes = {
  grid: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    rows: PropTypes.number.isRequired,
    columns: PropTypes.number.isRequired,
    cellSize: PropTypes.number.isRequired,
    initialPosition: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
    onAssetPlaced: PropTypes.func, // Callback to notify parent when asset is placed
  }),
};

export default SnapGrid;
