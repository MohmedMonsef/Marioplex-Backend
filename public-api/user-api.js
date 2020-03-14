const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');

const Track =  require('./track-api');
// initialize db 
const connection=require('../DBconnection/connection');
const bcrypt=require('bcrypt');
const User =  {
    

    getUserById : async function(userId){
        const user = await userDocument.findById(userId,(err,user)=>{
            if(err) return 0;
            return user;
        });
        
        return user;
    },
    
    likeTrack: async function(userID,trackID){
            const user = await this.getUserById(userID);
            if(!user){ return 0; }
            const likeTrack = await Track.likeTrack(user,trackID).catch();
            return likeTrack;
    },

    unlikeTrack: async function (userID,trackID){
        const user = await this.getUserById(userID);
        if(!user){ return 0; }
        const unlikeTrack = await Track.unlikeTrack(user,trackID);
        return unlikeTrack;
    },


    checkmail: async function (email){
   
        let user=await userDocument.findOne({email:email});
        
        if(!user)
        {
            return false;
        }
         return user;
    },
    
    updateforgottenpassword: async function (user){
       
        let password=user.displayName+"1234";
        const salt=await bcrypt.genSalt(10);
        let hashed=await bcrypt.hash(password,salt);
           user.password=hashed;
           await user.save();
           return password;
    }

}

module.exports = User;


