const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');

const Track =  require('./track-api');
const Playlist =  require('./Playlist-api');
// initialize db 
const connection=require('../DBconnection/connection');
const bcrypt=require('bcrypt');
const Artist=require('./Artist-api');
const sendmail=require('../ForgetPassword/sendmail');
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

    },
         
    

    followPlaylist: async function(userID,playlistID){
        const user = await this.getUserById(userID);
        if(!user){ return 0; }
        return  await Playlist.followPlaylist(user,playlistID);
     
    },

    unfollowPlaylist: async function(userID,playlistID){
        const user = await this.getUserById(userID);
        if(!user){ return 0; }
        return  await Playlist.unfollowPlaylist(user,playlistID);
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
            const createdPlaylist = await Playlist.createPlaylist(playlistName);
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
                isPrivate : false 
            });
            await user.save().catch();
            return createdPlaylist;
    
        },
           
        checkAuthorizedPlaylist:async  function (userID,playlistId){
            let users=await userDocument.find({});
            let createduser;
            let playlistindex;
            let found=false;
            for(let user in users){
                for (var i=0;i<users[user].createPlaylist.length;i++){
                    if(users[user].createPlaylist[i].playListId==playlistId){
                        createduser=users[user];
                        playlistindex=i;
                        found=true;
                        break;
                    }
                }
                if(found) break;
            }
            if(!createduser){return false;}
            if(createduser._id==userID){return true;}
            else {
                for(var i=0;i<createduser.createPlaylist[playlistindex].collaboratorsId.length;i++){
                    if(createduser.createPlaylist[playlistindex].collaboratorsId[i]==userID){
                        return true;
                    }
                }
            }
            return false;
        }    ,

        promoteToArtist: async function(userID,info,name,genre){
            user=await this.getUserById(userID);
            if(!user) return false;
            if(user.userType=="Artist"){
                return false;
            }
            let artist=await Artist.createArtist(userID,info,name,genre);
            if(!artist) return false;
            user.userType="Artist";
            await user.save();
            sendmail(user.email,"Congrats!! ^^) You're Now Promoted to Artist so You can Login with your Account as an Artist");
            return true;
        }


}

module.exports = User;


