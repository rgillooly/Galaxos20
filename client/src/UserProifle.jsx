import React from "react";
import { useUser } from "../context/UserContext";

const UserProfile = () => {
  const { user, loading, error } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!user) {
    return <div>User not found or not authenticated.</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      {/* Display other user details */}
    </div>
  );
};

export default UserProfile;
