const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtSecret = require('./jwt-key').secret;
// use passport jwt strategy
require('./jwt-config')(passport);

module.exports = {

// this middleware is used when dealing with secure endpoints api which require authentication
 jwtAuth : passport.authenticate('jwt', { session: false }),

// sign in with jwt this function is called whenever user is logging in to save a jwt token in the headers
 jwtSign : function(user){
const options = {
    expiresIn: '1d'
  };
  const payload = {
    user: user
  };
  const authToken = jwt.sign(payload, jwtSecret, options);
  return authToken;
}
}


