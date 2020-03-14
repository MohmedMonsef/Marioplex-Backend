const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');

const Track =  require('./track-api');
// initialize db 
const connection=require('../DBconnection/connection');

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
    }


}

module.exports = User;