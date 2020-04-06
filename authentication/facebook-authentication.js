const  FacebookStrategy = require('passport-facebook').Strategy;
const jwtSeret = require('../config/jwt-key');
const jwt =require('jsonwebtoken');
const FACEBOOK_APP_ID = require('./keys').facebook.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = require('./keys').facebook.FACEBOOK_APP_SECRET;
const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');


// initialize db 
const connection=require('../db-connection/connection');
// get jwt middleware
const JWT = require('../config/passport-jwt');

module.exports = (passport) => {
        passport.use(new FacebookStrategy({
            clientID: FACEBOOK_APP_ID,
            clientSecret: FACEBOOK_APP_SECRET,
            callbackURL: "/auth/facebook/callback",
            profileFields: ['id', 'emails', 'name','gender','photos','birthday','hometown','displayName']
           
        },
        async function(accessToken, refreshToken, profile, done) {
              
               if(profile){
                //if(!profile.emails) return done(true,null);
                   //console.log(profile);
                   let correctEmail=(profile.emails==undefined)?profile.email:profile.emails[0].values;
                    const user = await userDocument.findOne({ email:correctEmail },(err,user)=>{
                        if(err) return 0;
                        return user;
                    });
                    if(user){
                        // user in db
                       
                        return done(null,user);
                    }else{
                       // console.log(profile.emails);
                     //   if(!profile.emails) return done(true,null);
                        // create user
                        const newUser = await new userDocument({
                            email:correctEmail,
                            displayName:profile.displayName,
                            gender:profile.gender,
                            isFacebook:true,
                            product:"free" ,
                            userType:"user" ,
                            type:"user" ,
                            images:profile.photos ,
                            birthDate:profile._json.birthday ,
                            follow:[] ,
                            followedBy:[] ,
                            like:[] ,
                            createPlaylist:[] ,
                            saveAlbum:[] ,
                            playHistory:[]


                        }).save();
                       
                        return done(null,newUser);
                    }
               
               }
               
               return done(true,null);
        }
    ));
}

