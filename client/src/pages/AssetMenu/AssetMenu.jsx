import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./AssetMenu.css";

function AssetMenu({
  _id,
  title,
  position,
  assets, // This is an array of asset IDs, not the actual asset objects
  onDrop,
  onTitleUpdate,
  onAssetsUpdate,
  onClose,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [menuPosition, setMenuPosition] = useState(position);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [assetsState, setAssetsState] = useState([]); // Start with an empty array
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to retrieve the authentication token from localStorage
  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(
          `http://localhost:3001/api/assets/${_id}`, // Use `_id` as assetMenuId
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          console.log("Assets fetched:", response.data.assets);
          setAssetsState(response.data.assets); // Update state with fetched assets
        } else {
          console.error("Failed to fetch assets:", response.data.message);
          setError("Failed to load assets. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
        setError("Error fetching assets. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [_id]); // Fetch assets whenever the `_id` (menu ID) changes

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;

    setMenuPosition((prevPos) => ({
      top: prevPos.top + deltaY,
      left: prevPos.left + deltaX,
    }));

    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (onDrop) {
        onDrop(_id, menuPosition); // Call onDrop when drag is complete
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStartPos]);

  const handleTitleChange = (e) => {
    setCurrentTitle(e.target.value);
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!currentTitle.trim()) {
      alert("Title cannot be empty.");
      setCurrentTitle(title);
      setIsEditingTitle(false);
      return;
    }

    setIsEditingTitle(false);

    try {
      const token = getAuthToken();
      await axios.put(
        `http://localhost:3001/api/assetMenus/title-update/${_id}`,
        { title: currentTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onTitleUpdate) {
        onTitleUpdate(_id, currentTitle); // Notify parent about title change
      }
    } catch (error) {
      console.error("Error updating title:", error);
      setCurrentTitle(title); // Revert title on error
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetMenuId", _id);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/assets/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const uploadedAsset = response.data.asset; // Assuming backend returns the uploaded asset
        setAssetsState((prevAssets) => [...prevAssets, uploadedAsset]);
      } else {
        setUploadError("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading asset:", error);
      setUploadError("Error uploading asset. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="asset-menu"
      style={{
        position: "absolute",
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }}
      onMouseDown={handleMouseDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <header className="asset-menu-header">
        {isEditingTitle ? (
          <input
            type="text"
            value={currentTitle}
            onChange={handleTitleChange}
            onBlur={handleSaveTitle}
            autoFocus
            className="edit-input"
          />
        ) : (
          <h3 onClick={handleEditTitle}>{currentTitle}</h3>
        )}
        <button onClick={() => onClose && onClose(_id)}>Close</button>
      </header>
      {uploading && <p>Uploading...</p>}
      {uploadError && <p className="error-message">{uploadError}</p>}
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
      >
        <p>Drag and drop a file here to add it to the menu.</p>
      </div>
      <div className="asset-menu-content">
        {loading ? (
          <p>Loading assets...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : assetsState.length > 0 ? (
          <ul>
            {assetsState.map((asset) => (
              <li key={asset._id}>
                {asset.type && asset.type.startsWith("image") ? (
                  <img
                    src={`http://localhost:3001/${asset.filePath}`}
                    alt={asset.name}
                    className="asset-thumbnail"
                  />
                ) : (
                  <div className="file-icon">{asset.type}</div>
                )}
                <div>{asset.name}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No assets available</p>
        )}
      </div>
    </div>
  );
}

AssetMenu.propTypes = {
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  assets: PropTypes.array.isRequired, // These are the asset IDs
  onDrop: PropTypes.func.isRequired,
  onTitleUpdate: PropTypes.func.isRequired,
  onAssetsUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default AssetMenu;
