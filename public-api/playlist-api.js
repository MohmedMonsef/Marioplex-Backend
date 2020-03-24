const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');


// initialize db 
const connection=require('../DBconnection/connection');
const mongoose = require('mongoose');
const Track=require('./track-api');
const Playlist =  {


    // get track by id
    // params : track-id
    getPlaylist  : async function(playlistId){
        
        // connect to db and find track with the same id then return it as json file
        // if found return playlist else return 0
        const playlist = await playlistDocument.findById(playlistId,(err,playlist)=>{
            if(err) return 0;
            return playlist;
        }).catch((err)=> 0);
        return playlist;
        

    },

    checkIfUserHasPlaylist: function(user,playlistID){
        
        const userPlaylists = user.createPlaylist;
        
        if(userPlaylists){
           return  userPlaylists.find(playlist => playlist. playListId == playlistID);
        }
        return 0;
    },

    // create playlist by playlist_name
    // params : playlist name user 
    createPlaylist : async function(playlistName){

    // create new playlist
    const Playlist=new playlistDocument({
        _id: mongoose.Types.ObjectId(),
        type:"playlist" ,
        collaborative:"false" ,
        name:playlistName ,
        isPublic:true 
    })
    await Playlist.save();
    return Playlist;
    },

    //to delete playlist
    
    deletePlaylist  : async function(user,playlistId){
        const playlist = await await Playlist.getPlaylist(playlistId);
        if(playlist){        
                 const userHasPlaylist = await Playlist.checkIfUserHasPlaylist(user, playlistId);
                if(userHasPlaylist){
                    
                     // connect to db and find play with the same id then return it as json file
                
                    for(let i=0;i <user.createPlaylist.length;i++ ){
                        if(user.createPlaylist[i].playlistId == playlistId){
                            user.createPlaylist.splice(i,1);
                        }
                    }
                    await user.save().catch();
                    const delPlaylist = await playlistDocument.findByIdAndDelete(playlistId,(err,playlist)=>{
                        if(err) return 0;
                        return  1;
                    }).catch((err)=> 0); 
                    return 1;
               }
           }
            else return 0;
        },

        //follow playlist
        checkFollowPlaylistByUser: function(user,playlistID){
        
            const followedplaylists = user.followPlaylist;
            
            if(followedplaylists){
               const followed =  followedplaylists.find(playlist => playlist.playListId == playlistID);
              
                return followed
            }
            return 0;
        },
        //user follow playlist by playlist-id
        //params : user , playlist-id
        followPlaylist: async function(user,playlistID){
            const followedBefore= this.checkFollowPlaylistByUser(user,playlistID)
            if (followedBefore){
                return 0;
            }
            if(user.followPlaylist){
                user.followPlaylist.push({
                    playListId: playlistID,
                    isPrivate:false
                });
                await user.save();
                return 1;
            }
            user.followPlaylist = [];
            user.followPlaylist.push({
                playListId: playlistID
            });
            await user.save().catch();
            return 1;
        },

        unfollowPlaylist: async function(user,playlistID){
            const followedBefore= this.checkFollowPlaylistByUser(user,playlistID)
           
            if (!followedBefore){
               
                return 0;
            }
            if(user.followPlaylist){
               
                for(let i=0;i <user.followPlaylist.length;i++ ){
                  
                    if(user.followPlaylist[i].playListId == playlistID){
                       
                        user.followPlaylist.splice(i,1);
                        await user.save();
                        return 1;
                    }
                }
            }
            return 0;
        },
        addTrackToPlaylist : async function(playlistID,tracksIds){

            let playlist=await this.getPlaylist(playlistID);
            if(!playlist) return 0;
            console.log(playlist);
            let len=playlist.snapshot.length;
            let tracks=[];
            if(len){
            for(let i=0;i<playlist.snapshot[len-1].hasTracks.length;i++){
             tracks.push(playlist.snapshot[len-1].hasTracks[i]);
            }
        }
            for(let i=0;i<tracksIds.length;i++){
                tracks.push(tracksIds[i]);
            }
            let uniquetracks=await this.removeDups(tracks);
            console.log(uniquetracks);
            playlist.snapshot.push({
                hasTracks:uniquetracks,
                action:'Add Tracks'
            });
            await playlist.save();
            return playlist;
            },
      removeDups:async function (tracks) {
                let unique = {};
                tracks.forEach(function(i) {
                  if(!unique[i]) {
                    unique[i] = true;
                  }
                });
                return Object.keys(unique);
              },
    updatePlaylistDetails : async function(playlistId,details){

                let playlist=await this.getPlaylist(playlistId);
                if(!playlist)return 0;
               await playlistDocument.updateOne({_id:playlistId},details);
                playlist=await this.getPlaylist(playlistId);
                return playlist;
                },
        getUserPlaylists : async function(userId,limit,offset,isuser){
                let user=await userDocument.findById(userId);
                if(!user) return 0;
                let playlistsIds=[];
                let playlists=[];
                    for (var i=0;i<user.createPlaylist.length;i++){
                        if(isuser){
                        playlistsIds.push(user.createPlaylist[i].playListId);
                        }
                        else{
                            if(!user.createPlaylist[i].isPrivate){
                                playlistsIds.push(user.createPlaylist[i].playListId);
                            }
                        }
                    }
                    for (var i=0;i<user.followPlaylist.length;i++){
                        if(isuser){
                            playlistsIds.push(user.followPlaylist[i].playListId);
                        }
                            else{
                                if(!user.followPlaylist[i].isPrivate){
                                    playlistsIds.push(user.followPlaylist[i].playListId);
                                }
                            }
                    }
                    for(var i=0;i<playlistsIds.length;i++){
                        let playlist=await this.getPlaylist(playlistsIds[i]);
                        playlists.push(playlist);
                    }
                    let start=0;
                    let end=playlists.length;
                    if(offset!=undefined){
                    if(offset>=0&&offset<=playlists.length){
                        start=offset;
                    }
                }
                if(limit!=undefined){
                    if((start+limit)>0&&(start+limit)<=playlists.length){
                        end=start+limit;
                    }
                }
                playlists.slice(start,end);
                    return playlists;
            },
     changeCollaboration : async function(user,playlistID){
              let playlist=await playlistDocument.findById(playlistID);
              if(!playlist) return false;
              playlist.collaborative=!playlist.collaborative;
              console.log(user);
              if(playlist.collaborative){
                  playlist.isPublic=false;
                  for (var i=0;i<user.createPlaylist.length;i++){
                    if(user.createPlaylist[i].playListId==playlistID){
                        user.createPlaylist[i].isPrivate=true;
                        await user.save();
                        await playlist.save();
                        return true;
                    }
                }
                }
                 return true;
                
            },
        changePublic : async function(user,playlistID){
                let playlist=await playlistDocument.findById(playlistID);
                if(!playlist) return false;
                playlist.isPublic=!playlist.isPublic;

                    for (var i=0;i<user.createPlaylist.length;i++){
                      if(user.createPlaylist[i].playListId==playlistID){
                          user.createPlaylist[i].isPrivate=!user.createPlaylist[i].isPrivate;
                          await user.save();
                          await playlist.save();
                          return true;
                      }
                  }
                  
                  for (var i=0;i<user.followPlaylist.length;i++){
                    if(user.followPlaylist[i].playListId==playlistID){
                        user.followPlaylist[i].isPrivate=!user.followPlaylist[i].isPrivate;
                        await user.save();
                        await playlist.save();
                        return true;
                    }
                }
                   return false;
                  
              },
     getPlaylistTracks : async function(playlistID){
                let playlist=await playlistDocument.findById(playlistID);
                if(!playlist) return 0;
                let tracks=[];
                let len=playlist.snapshot.length;

                    for (var i=0;i<playlist.snapshot[len-1].hasTracks.length;i++)
                       {
                            let track=await Track.getTrack(playlist.snapshot[len-1].hasTracks[i]);
                            if(track)
                            {
                                tracks.push(track);
                            }
                       }
                  return tracks;
                  
              },

        removePlaylistTracks : async function(playlistID,tracksids,snapshotid){
                let playlist=await playlistDocument.findById(playlistID);
                if(!playlist) return 0;
                let tracks=[];
                let len=playlist.snapshot.length;
                if(len==0){return 0;}
                let found=false;
                if(snapshotid!=undefined){
                    for(var i=0;i<playlist.snapshot.length;i++){
                        if(playlist.snapshot[i]._id==snapshotid){
                            len=i+1;
                            found=true;
                            break;
                        }
                    }
                    if(!found){return 0;}
                }
                    for (var i=0;i<playlist.snapshot[len-1].hasTracks.length;i++)
                       {
                            let track=await Track.getTrack(playlist.snapshot[len-1].hasTracks[i]);
                            if(track)
                            {
                                tracks.push(track);
                            }
                       }
                       for(var i=0;i<tracksids.length;i++){
                           for(var j=0;j<tracks.length;j++){
                               if(tracksids[i]==tracks[j]._id){
                                   tracks.splice(j,1);
                                   console.log(tracks);
                               }
                           }
                       }
                 playlist.snapshot.push({
                        hasTracks:tracks,
                        action:'remove Tracks'
                    });
                    await playlist.save();
                    return playlist;
                  
              },
          reorderPlaylistTracks : async function(playlistID,snapshotid,start,length,before){
                let playlist=await playlistDocument.findById(playlistID);
                if(!playlist) return 0;
                let tracks=[];
                let len=playlist.snapshot.length;
                if(len==0){return 0;}
                let found=false;
                if(snapshotid!=undefined){
                    for(var i=0;i<playlist.snapshot.length;i++){
                        if(playlist.snapshot[i]._id==snapshotid){
                            len=i+1;
                            found=true;
                            break;
                        }
                    }
                    if(!found){return 0;}
                }
               console.log(found);
                    for (var i=0;i<playlist.snapshot[len-1].hasTracks.length;i++)
                       {
                            let track=await Track.getTrack(playlist.snapshot[len-1].hasTracks[i]);
                            if(track)
                            {
                                tracks.push(track._id);
                            }
                       }
                       let orderedtracks=[];
                       let stindex=Number(start);
                       let endindex=(length==undefined)?Number(stindex+1):((stindex+length)>tracks.length)?tracks.length-Number(start):length;
                     console.log(endindex);
                       for(var i=stindex;i<endindex+stindex;i++){
                           console.log("Ssss");
                        orderedtracks.push(tracks[i]);
                       }
                       console.log(orderedtracks);
                       tracks.splice(stindex,endindex);
                       for(let i=0;i<orderedtracks.length;i++){
                        tracks.splice(before+i,0,orderedtracks[i]);
                       }
                       console.log(tracks);
                     playlist.snapshot.push({
                        hasTracks:tracks,
                        action:'reorder Tracks'
                    });
                    await playlist.save();
                    return playlist;
                  
              },
    }



module.exports = Playlist;

