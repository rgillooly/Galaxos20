import { Route, Routes } from "react-router-dom";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";
import Home from "./Home/Home";
import GameList from "./GameList/GameList";
import React from "react";
import Logout from "./Logout/Logout";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/GameList" element={<GameList />} />
        <Route path="/logout" element={<Logout />} /> {/* Add Logout route */}
      </Routes>
    </div>
  );
}

export default App;
