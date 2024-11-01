// AssetMenu.js
import React, { useState, useEffect } from "react";
import "./AssetMenu.css"; // Optional: Add your styles here

function AssetMenu({ initialMenuName, onClose, onRename }) {
  const [menuName, setMenuName] = useState(initialMenuName);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ top: 100, left: 100 }); // Initial position of the asset menu
  const [assets, setAssets] = useState([]); // Array to hold assets

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        top: e.clientY - offset.y,
        left: e.clientX - offset.x,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleRename = () => {
    const newName = prompt("Enter new menu name:", menuName);
    if (newName) {
      setMenuName(newName);
      onRename(newName);
    }
  };

  const addAsset = () => {
    const newAssetName = prompt("Enter asset name:");
    if (newAssetName) {
      setAssets([...assets, newAssetName]);
    }
  };

  const deleteAsset = (index) => {
    setAssets(assets.filter((_, i) => i !== index)); // Delete asset by index
  };

  return (
    <div
      className="asset-menu"
      style={{ position: "absolute", top: position.top, left: position.left }}
      onMouseDown={handleMouseDown}
    >
      <header className="menu-header">
        <h4>{menuName}</h4>
        <button onClick={handleRename}>Rename</button>
        <button onClick={onClose}>Close</button>
      </header>
      <div className="menu-content">
        <button onClick={addAsset}>Add Asset</button>
        <ul>
          {assets.map((asset, index) => (
            <li key={index}>
              {asset}
              <button onClick={() => deleteAsset(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AssetMenu;
