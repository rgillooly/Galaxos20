const { gql } = require("graphql-tag");

const typeDefs = gql`
  input GameInput {
    name: String!
    description: String!
  }

  type Position {
    top: Int
    left: Int
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Auth {
    token: ID!
    user: User
  }

  type User {
    id: ID! # Ensure we always use 'id' in GraphQL
    username: String!
    email: String!
    password: String!
    games: [Game] # List of games created by the user
  }

  type Game {
    id: ID! # ID of the game, ensure this matches the MongoDB id field (aliased)
    name: String!
    description: String
    user: User
    assetMenus: [AssetMenu] # Link games to asset menus
  }

  type AssetMenu {
    id: ID!
    gameId: ID!
    title: String!
    position: Position!
    assets: [Asset]!
  }

  type Asset {
    id: ID!
    type: String
    url: String
  }

  input AssetMenuInput {
    title: String!
    position: PositionInput!
  }

  input PositionInput {
    top: Int
    left: Int
  }

  input AssetInput {
    name: String!
    type: String!
    url: String
  }

  input CreateGameInput {
    id: ID!
    name: String!
    description: String
    assetMenus: [AssetMenuInput] # Include asset menus in the input
  }

  type Query {
    users: [User]
    getUser(id: ID!): User # Fetch a user by id
    getGames: [Game]! # Fetch all games
    getAssetMenus: [AssetMenu] # Get all asset menus
    getAssetMenu(id: ID!): AssetMenu # Get a specific asset menu by id
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    createGame(input: GameInput!, userId: ID!): Game
    updateGame(id: ID!, name: String!): Game
    deleteGame(id: ID!): Game
    createAssetMenuAndLink(
      gameId: ID!
      title: String!
      position: PositionInput
      assets: [AssetInput!]!
    ): AssetMenu
    updateAssetMenu(id: ID!, name: String, position: PositionInput): AssetMenu
    deleteAssetMenu(id: ID!): Boolean
  }
`;

module.exports = typeDefs;
