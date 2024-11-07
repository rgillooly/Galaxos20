import React from "react";
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "react-toastify/dist/ReactToastify.css"
import App from "./App"

// Import components for routing
import Signup from "./Signup/Signup.jsx";
import LoginPage from "./Login/Login.jsx";
import GameList from "./GameList/GameList.jsx";
import Home from "./Home/Home.jsx"; // Ensure you import the Landing component

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <BrowserRouter>
    <App/>
    </BrowserRouter>
);
