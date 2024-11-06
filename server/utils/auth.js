const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

const secret = 'mysecretssshhhhhhh'; // Ideally, this should come from an environment variable
const expiration = '2h'; // Token expiration time

module.exports = {
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  }),
  
  authMiddleware: function ({ req }) {
    let token = req.body.token || req.query.token || req.headers.authorization;

    // If token is in the Authorization header, split to get the token (removes 'Bearer')
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // If no token is provided, we do nothing, but context will not have user
    if (!token) {
      return req;
    }

    try {
      // Verify token and set user to the request object
      const { data } = jwt.verify(token, secret); // Do not use maxAge here, rely on token expiration set above
      req.user = data;  // Set the decoded user to the request object
    } catch (err) {
      console.log("Token verification failed:", err);
      throw new GraphQLError('Invalid or expired token', {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }

    return req;
  },

  signToken: function ({ email, username, _id }) {
    const payload = { email, username, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration }); // Expiration time for token
  },
};
