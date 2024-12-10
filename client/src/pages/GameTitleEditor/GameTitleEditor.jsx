import React, { useState } from "react";

const GameTitleEditor = ({ gameName, onChange }) => {
  const [newName, setNewName] = useState(gameName);

  const handleBlur = () => {
    onChange(newName);
  };

  return (
    <div>
      <h1 className="game-name">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      </h1>
    </div>
  );
};

export default GameTitleEditor;
