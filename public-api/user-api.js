const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
const Track =  require('./track-api');
const Playlist =  require('./Playlist-api');
const Player =require('./player-api');
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
    addTrack: async function (user,trackID,playlistID){
        const Playlist = await playlist.findById(playlistID);
        const Track = await track.findById(trackID);
        if(!Playlist||!Track){ return 0; }
        if(Playlist.hasTracks){
            user.hasTracks.push({
                trackId: trackID
               
            });
            await Playlist.save();
            return 1;
            
        }
        Playlist.hasTracks = [];
        Playlist.hasTracks.push({
            trackId: trackID

        });
        await Playlist.save();
        return 1;



        
    },
    AddTrackToPlaylist: async function (userID,trackID,playlistID){
        const user = await this.getUserById(userID);
        const userplaylist= await user.createPlaylist.find({playListId:playlistID});
        if(!user||userplaylist){ return 0; }
        const addTrack = await this.addTrack(user,trackID,playlistID);
        return addTrack;
    },
    



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
    },

    createQueue:async function (userID,isPlaylist,sourceId,trackId){
        const user = await this.getUserById(userID);
        const isCreateQueue= await Player.createQueue(user,isPlaylist,sourceId,trackId);       
        return isCreateQueue ;
    },

    addToQueue:async function (userID,trackId){
        const user = await this.getUserById(userID);
        const isAddQueue= await Player.addToQueue(user,trackId);       
        return isAddQueue ;
        
    },
    updateUserPlayer: async function(userID,isPlaylist,sourceId,trackID){
        const user = await this.getUserById(userID);
        
        const queu = await Player.createQueue(user,isPlaylist,sourceId,trackID);
        console.log(queu)
        if(!queu) return 0;
        const player = await Player.setPlayerInstance(user,isPlaylist,sourceId,trackID);
        if(!player) return 0;
        return 1;
    },
    getQueue: async function(userId){
        const user = await this.getUserById(userId);
        if(!user) return 0;
        const tracks = await Player.getQueue(user);
        if(!tracks) return 0;
        return tracks; 
    },
    setShuffle:async function(state,userId){
        const user = await this.getUserById(userId);
        if(!user) return 0;
        const isShuffle = await Player.setShuffle(state,user);
        if(!isShuffle) return 0;
        return 1;
    }

}

module.exports = User;


