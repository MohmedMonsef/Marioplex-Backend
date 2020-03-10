const  FacebookStrategy = require('passport-facebook').Strategy;
const FACEBOOK_APP_ID = require('./keys').facebook.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = require('./keys').facebook.FACEBOOK_APP_SECRET;

module.exports = (passport) => {
        passport.use(new FacebookStrategy({
            clientID: FACEBOOK_APP_ID,
            clientSecret: FACEBOOK_APP_SECRET,
            callbackURL: "/auth/facebook/callback"
        },
        function(accessToken, refreshToken, profile, done) {
              // TO DO 
              // CHECK IF USER IN DB IF TRUE THEN LOG HIM IN ELSE CREATE A NEW ACCOUNT FOR USER
               if(profile){
                   return done(null,profile);
               }
               return done(true,null);
        }
    ));
}

