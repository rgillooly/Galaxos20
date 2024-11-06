import { gql } from "apollo-server-express";

const typeDefs = gql`
  type AuthPayload {
    user: User!
  }

  type User {
    id: ID!
    username: String!
    password: String! # Consider removing this if you don't want to expose it
    createdGames: [Game!]! # List of games created by the user
  }

  type Game {
    id: ID!
    name: String!
    description: String!
    genre: String!
    userId: ID!
    user: User! # Link to User
    assetMenus: [AssetMenu!]! # Add this line to link the Game to AssetMenus
    createdAt: String
    updatedAt: String
  }

  input CreateGameInput {
    name: String!
    description: String!
    genre: String!
  }

  type AssetMenu {
    id: ID! # Unique identifier for the AssetMenu
    name: String! # Name of the AssetMenu
    gameId: ID # ID of the associated Game
    assets: [String] # List of assets associated with this menu
  }

  type Query {
    users: [User]
    getGames: [Game!]!
    getAssetMenus: [AssetMenu] # Query to get all AssetMenus
    getAssetMenu(id: ID!): AssetMenu # Query to get a single AssetMenu by ID
  }

  type Mutation {
    signupUser(username: String!, password: String!): User
    login(username: String!, password: String!): AuthPayload
    createGame(input: CreateGameInput!): Game # Updated to accept input
    updateGame(id: ID!, name: String!): Game # Update an existing game
    deleteGame(id: ID!): Game # Delete a game
    createAssetMenu(name: String!, gameId: ID!): AssetMenu # Mutation to create an AssetMenu
    updateAssetMenu(id: ID!, name: String): AssetMenu # Mutation to update an AssetMenu
    deleteAssetMenu(id: ID!): Boolean # Mutation to delete an AssetMenu
  }
`;

export default typeDefs;
