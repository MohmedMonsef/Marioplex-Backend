const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');

const Track =  require('./track-api');

const Playlist =  require('./Playlist-api');

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

<<<<<<< HEAD

    followPlaylist: async function(userID,playlistID){
        const user = await this.getUserById(userID);
        if(!user){ return 0; }
        return  Playlist.followPlaylist(user,playlistID);
     
    },

    unfollowPlaylist: async function(userID,playlistID){
        const user = await this.getUserById(userID);
        if(!user){ return 0; }
        return  Playlist.unfollowPlaylist(user,playlistID);
    },

    deletePlaylist:async  function (userID,playlistID){
            const user = await this.getUserById(userID);
            if(!user){ return 0; }
          
            const isDelete = await Playlist.deletePlaylist(user,playlistID);
            return isDelete;
          
    },
    createdPlaylist:async  function (userID,playlistName){
            const user = await this.getUserById(userID);
            // create new playlist
            const createdPlaylist = await Playlist.createPlaylist(playlistName)
            //add to user 
            if(user.createPlaylist){
                user.createPlaylist.push({
                    playListId: createdPlaylist._id,
                    addedAt:  Date.now() ,
                    isLocal : 'false' 
                });
                await user.save();
                return createdPlaylist;
                
            }
            user.createPlaylist = [];
            user.createPlaylist.push({
                playListId: createdPlaylist._id,
                addedAt: Date.now(),
                isLocal : 'false' 
            });
            await user.save().catch();
            return createdPlaylist;
    
        }
           
          

=======
    checkmail: async function (email){
    
        let user=await userDocument.findOne({email:email});
        
        if(!user)
        {
            return false;
        }
        return user;
    },
>>>>>>> ab5caf6f5b53307ea986f73a6a8d9c18c77f2441

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


