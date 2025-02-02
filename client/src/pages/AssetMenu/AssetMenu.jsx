import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const AssetMenu = ({
  menu,
  fetchAssets,
  updatePosition,
  name,
  setIsDraggingAsset,
}) => {
  const [assets, setAssets] = useState([]);
  const [position, setPosition] = useState({ top: 100, left: 100 });
  const [draggingAsset, setDraggingAsset] = useState(null);
  const [hasLoadedPosition, setHasLoadedPosition] = useState(false);
  const [droppedAssets, setDroppedAssets] = useState([]);
  const dragOffset = useRef({ x: 0, y: 0 });
  const prevPosition = useRef(position);

  // Load asset menu position only once on mount
  useEffect(() => {
    if (hasLoadedPosition) return;

    const loadAssetMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. User is not authenticated.");
          return;
        }

        const response = await fetch(
          `http://localhost:3001/api/assetMenus/${menu._id}`,
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

        if (data.assetMenu?.position) {
          const newPosition = {
            top: Number(data.assetMenu.position.top) || 100,
            left: Number(data.assetMenu.position.left) || 100,
          };

          setPosition(newPosition);
          prevPosition.current = newPosition;
          setHasLoadedPosition(true);
        }
      } catch (error) {
        console.error("Error loading asset menu:", error);
      }
    };

    loadAssetMenu();
  }, [menu._id, hasLoadedPosition]);

  // Update position after drag stops
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

  // Handle drag start
  const handleStart = useCallback(
    (e, data) => {
      setIsDraggingAsset(true);
      setDraggingAsset(e.target);
    },
    [setIsDraggingAsset]
  );

  // Handle drag stop
  const handleStop = useCallback(
    (e, data) => {
      const newPosition = {
        top: prevPosition.current.top + data.y,
        left: prevPosition.current.left + data.x,
      };

      setPosition(newPosition);
      prevPosition.current = newPosition;

      updateMenuPosition(menu._id, newPosition);

      setIsDraggingAsset(false);
      setDraggingAsset(null);
    },
    [menu._id, setIsDraggingAsset]
  );

  // Handle drag movement
  const handleDrag = useCallback((e, data) => {
    dragOffset.current = { x: data.deltaX, y: data.deltaY };
  }, []);

  // Handle dragover (to allow dropping)
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();

      const rect = e.target.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;

      if (draggingAsset) {
        setDroppedAssets((prev) => [
          ...prev,
          { asset: draggingAsset, position: { x: dropX, y: dropY } },
        ]);
      }
    },
    [draggingAsset]
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
        >
          <h3>{name}</h3>
        </div>
        <div
          className="asset-list"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            position: "relative",
            height: "100%",
            padding: "10px",
            overflowY: "auto",
            border: "2px dashed #ccc",
          }}
        >
          {assets.length > 0 ? (
            assets.map((asset) => {
              const { id, imageUrl, name } = asset;
              const assetImageUrl = imageUrl || "default_image_url.png";
              return (
                <div key={id} className="asset-item" draggable>
                  <img src={assetImageUrl} alt={name} />
                  <p>{name}</p>
                </div>
              );
            })
          ) : (
            <p>No assets available</p>
          )}

          {/* Render dropped assets */}
          {droppedAssets.length > 0 &&
            droppedAssets.map((item, index) => {
              const { asset, position } = item;
              const { imageUrl, name } = asset;
              const droppedAssetImageUrl = imageUrl || "default_image_url.png";

              return (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    padding: "5px",
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src={droppedAssetImageUrl}
                    alt={name}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </Draggable>
  );
};

AssetMenu.propTypes = {
  menu: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    position: PropTypes.object.isRequired,
  }),
  fetchAssets: PropTypes.func.isRequired,
  updatePosition: PropTypes.func.isRequired,
  setIsDraggingAsset: PropTypes.func.isRequired,
};

export default AssetMenu;
