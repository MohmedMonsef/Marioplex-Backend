const jwtSecret = require('./jwt-key')
const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;

const pasport = require('passport');
const spotifySchema = require('../models/db');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

User = spotifySchema.User

function login() {
    passport.use(
        'login',
        (email, password, done) => {
            try {
                User.findOne({
                    where: {
                        email: email,
                    },

                }).then(User => {
                    if (User === null) {
                        return done(null, false, { message: 'incorrect email!' });
                    } else {
                        bcrypt.compare(password, User.password).then(response => {
                            if (response === false) {
                                Console.log('password do not match');
                                return done(null, false, { messge: 'password do not match' });
                            }
                            Console.log('User found');
                            return done(null, User);
                        });
                    }
                });
            } catch (err) {
                done(err);
            }
        }

    )
}

const opts = {
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

            return done(null, true);
        })
    );
};