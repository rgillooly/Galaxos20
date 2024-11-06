const { AuthenticationError, ApolloError } = require("@apollo/server/express4");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { models } = require("../models");

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "fallback_secret";

const signToken = (user) => {
  const payload = {
    data: {
      id: user._id,
      email: user.email,
      username: user.username,
    },
  };

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
    console.log("Token generated:", token); // Log to verify token is generated
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new ApolloError("Error generating token.");
  }
};

const resolvers = {
  User: {
    id: (parent) => parent._id.toString(),
    games: async (user) => {
      // Correctly map the games for this user
      const games = await Game.find({ user: user._id });
      return games.map((game) => ({
        ...game.toObject(),
        id: game._id.toString(), // Map _id to id
      }));
    },
  },
  Game: {
    id: (parent) => parent._id.toString(),
    assetMenus: async (game) => {
      const assetMenus = await AssetMenu.find({ gameId: game._id });
      return assetMenus.map((assetMenu) => ({
        ...assetMenu.toObject(),
        id: assetMenu._id.toString(), // Map _id to id
      }));
    },
  },
  AssetMenu: {
    id: (parent) => parent._id.toString(),
  },
  Query: {
    getGames: async (_, __, context) => {
      const { Game } = context.models; // Access context.models here
      const games = await Game.find();
      return games;
    },

    getAssetMenus: async (_, { gameId }) => {
      const assetMenus = await AssetMenu.find({ gameId }).populate("gameId");
      return assetMenus.map((assetMenu) => ({
        ...assetMenu.toObject(),
        id: assetMenu._id.toString(), // Map _id to id
      }));
    },

    users: async () => {
      const users = await User.find();
      return users.map((user) => ({
        ...user.toObject(),
        id: user._id.toString(), // Map _id to id
      }));
    },

    getUser: async (_, { id }, { User }) => {
      return await User.findById(id);
    },
  },

  Mutation: {
    login: async () => {},

    updateGame: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to update a game."
        );
      }

      const game = await Game.findOne({ _id: id, user: context.user.id });
      if (!game) {
        throw new Error(
          "Game not found or you do not have permission to update it."
        );
      }

      const updatedGame = await Game.findByIdAndUpdate(id, input, {
        new: true,
      });
      return {
        ...updatedGame.toObject(),
        id: updatedGame._id.toString(),
      };
    },

    deleteGame: async (parent, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Unauthorized");
      }
      const game = await Game.findByIdAndDelete(id);
      if (!game) {
        throw new Error("Game not found");
      }
      return {
        ...game.toObject(),
        id: game._id.toString(), // Map _id to id
      };
    },

    createAssetMenuAndLink: async (
      _,
      { gameId, title, position, assets },
      context
    ) => {
      const { Game, AssetMenu } = context.models; // Destructure context.models inside the resolver

      if (!Game || !AssetMenu) {
        throw new ApolloError("Game or AssetMenu model not found in context.");
      }

      // Validate and convert `gameId` if necessary
      if (!mongoose.Types.ObjectId.isValid(gameId)) {
        throw new ApolloError("Invalid gameId format.");
      }

      try {
        const game = await Game.findById(mongoose.Types.ObjectId(gameId));
        if (!game) {
          throw new ApolloError("Game not found");
        }

        const assetMenu = new AssetMenu({
          gameId,
          title,
          position,
          assets,
        });

        await assetMenu.save();
        return assetMenu;
      } catch (error) {
        console.error("Error creating asset menu:", error);
        throw new ApolloError("Failed to create asset menu");
      }
    },

    deleteAssetMenu: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Unauthorized");
      }
      await AssetMenu.findByIdAndDelete(id);
      return true;
    },
  },
};

module.exports = resolvers;
