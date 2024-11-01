// GameContainer.js
import React, { useState, useEffect } from "react";
import AssetMenu from "./AssetMenu"; // Import the new AssetMenu component
import "./GameContainer.css"; // Optional: Add your styles here

function GameContainer({ initialGameName, onClose, onRename }) {
  const [gameName, setGameName] = useState(initialGameName);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ top: 50, left: 50 }); // Initial position of the game container
  const [menus, setMenus] = useState([]); // Array to hold menus

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
    const newName = prompt("Enter new game name:", gameName);
    if (newName) {
      setGameName(newName);
      onRename(newName);
    }
  };

  const addMenu = () => {
    const newMenuName = `Menu ${menus.length + 1}`; // Auto-generated name
    setMenus([...menus, { name: newMenuName, id: Date.now(), assets: [] }]);
  };

  const closeMenu = (id) => {
    setMenus(menus.filter((menu) => menu.id !== id)); // Remove menu by id
  };

  return (
    <div
      className="game-container"
      style={{ position: "absolute", top: position.top, left: position.left }}
      onMouseDown={handleMouseDown}
    >
      <header className="game-header">
        <h3>{gameName}</h3>
        <button onClick={handleRename}>Rename</button>
        <button onClick={onClose}>Close</button>
      </header>
      <div className="game-content">
        <button onClick={addMenu}>Add Menu</button>
        <ul>
          {menus.map((menu) => (
            <li key={menu.id}>
              <AssetMenu
                initialMenuName={menu.name}
                onClose={() => closeMenu(menu.id)}
                onRename={(newName) => {
                  setMenus(
                    menus.map((m) =>
                      m.id === menu.id ? { ...m, name: newName } : m
                    )
                  );
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default GameContainer;
