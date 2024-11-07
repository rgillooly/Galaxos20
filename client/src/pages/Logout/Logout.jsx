import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the JWT token from localStorage
    localStorage.removeItem("token");

    const { setUser } = useContext(UserContext);
    setUser(null);

    // Redirect to login page after logout
    navigate("/login");
  }, [navigate]);

  return (
    <div className="logout-container">
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
