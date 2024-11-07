import { Route, Routes } from "react-router-dom";
import Login  from "./Login/Login";
import Signup  from "./Signup/Signup"
import Landing from "./Home/Home";
import GameList from "./GameList/GameList"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/GameList" element={<GameList />} />
      </Routes>
    </div>
  );
}

export default App;