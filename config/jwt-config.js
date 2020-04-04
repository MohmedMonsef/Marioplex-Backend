const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const jwtSecret = require('./jwt-key').secret;


module.exports = passport => passport.use( new JwtStrategy({
    secretOrKey: jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer')
  }, (payload, done) => {
    // The following line accepts the JWT and sets `req.user = user`
    done(null, payload.user);  // JWT is valid - sets `req.user = payload.user`
 }));