// utils/mutations.js
import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        username
      }
    }
  }
`;

export const CREATE_GAME = gql`
  mutation CreateGame($input: GameInput!, $userId: ID!) {
    createGame(input: $input, userId: $userId) {
      _id
      name
      description
    }
  }
`;

export const CREATE_ASSET_MENU = gql`
  mutation CreateAssetMenu(
    $gameId: ID!
    $title: String!
    $position: PositionInput
    $assets: [AssetInput!]!
  ) {
    createAssetMenuAndLink(
      gameId: $gameId
      title: $title
      position: $position
      assets: $assets
    ) {
      id
      gameId
      title
      position {
        top
        left
      }
      assets {
        id
        type
        url
      }
    }
  }
`;