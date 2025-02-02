import React, { useState } from "react";

const InputField = () => {
  const [text, setText] = useState("");

  return (
    <div
      style={{ padding: 10, border: "1px solid #ddd", background: "#f9f9f9" }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
      />
    </div>
  );
};

export default InputField;
