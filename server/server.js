const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const jwt = require("jsonwebtoken");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

// Middleware function to verify tokens
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).send("Token is required");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.status(401).send("Invalid token");
    }
    req.user = decoded; // Add the decoded information to the request
    next();
  });
}

const PORT = process.env.PORT || 3001;
const app = express();

// Create a new instance of Apollo Server with the GraphQL schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Use Apollo's express middleware for the '/graphql' endpoint
  app.use(
    "/graphql",
    verifyToken, // Token verification middleware (you can add other middlewares like authMiddleware if needed)
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start the server
startApolloServer();
