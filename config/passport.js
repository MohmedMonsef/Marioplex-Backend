const jwtSecret =require('./jwtconfig');
const bcrypt=require('bcrypt');

const BCRYPT_SALT_ROUNDS=12;

const pasport=require('passport');
const spotifySchema = require('../models/DB');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

User= spotifySchema.User

const opts ={
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret.secret,

};

module.exports = passport => {
    passport.use(
      new JwtStrategy(opts, (jwt_payload, done) => {
        User.findById(jwt_payload.id)
          .then(user => {
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          })
          .catch(err => console.log(err));
      })
    );
  };