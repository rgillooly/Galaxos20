const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, message: "Not A Token" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // Map userId to _id for consistency
    req.user = { ...user, _id: user.userId };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }
};

module.exports = authenticateJWT;
