import React, { useState } from "react";

const GameDescriptionEditor = ({ gameDescription, onChange }) => {
  const [newDescription, setNewDescription] = useState(gameDescription);

  const handleBlur = () => {
    onChange(newDescription);
  };

  return (
    <div>
      <p>
        <input
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      </p>
    </div>
  );
};

export default GameDescriptionEditor;
