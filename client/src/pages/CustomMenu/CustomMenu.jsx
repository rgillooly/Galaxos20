import React, { useState, useRef, useEffect } from "react";

const CustomMenu = ({ items, position }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      {items.map((Item, index) => (
        <div key={index} style={{ padding: "8px 16px" }}>
          <Item />
        </div>
      ))}
    </div>
  );
};

const CustomRightClickMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef();

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuVisible(true);
    setMenuPosition({ x: e.pageX, y: e.pageY });
  };

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const componentsList = [
    () => <div>Component 1</div>,
    () => <div>Component 2</div>,
    () => <button onClick={() => alert("Button clicked!")}>Component 3</button>,
  ];

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        onContextMenu={handleContextMenu}
        style={{
          width: "200px",
          height: "100px",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "context-menu",
        }}
      >
        Right-Click Me
      </div>

      {menuVisible && (
        <div ref={menuRef}>
          <CustomMenu items={componentsList} position={menuPosition} />
        </div>
      )}
    </div>
  );
};

export default CustomRightClickMenu;
