const jwt = require('jsonwebtoken');

const jwtSecret = require('./jwt-key').secret;
// Generate an Access Token for the given User ID
function generateAccessToken(userId) {
  // How long will the token be valid for
  const expiresIn = '1 hour';
  
  // The signing key for signing the token
  const secret = jwtSecret;

  const token = jwt.sign({}, secret, {
    expiresIn: expiresIn,
   
    subject: userId.toString()
  });

  return token;
}

