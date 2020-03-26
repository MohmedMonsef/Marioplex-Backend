const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');


// initialize db 
const connection=require('../DBconnection/connection');
const mongoose = require('mongoose');
const Track =require('./track-api');
const Album =require('./album-api');
const Artist =require('./artist-api');
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
    //for routes
    getPlaylistWithTracks : async function(playlistId,snapshot,user){    
        const playlist = await this.getPlaylist(playlistId);
        if (playlist.isPublic || this.checkIfUserHasPlaylist(user,playlistId)||this.checkFollowPlaylistByUser(user,playlistId)){
            var playlistJson=[];
            var tracks=[];
            if(playlist.snapshot[snapshot]){
                for(let i=0;i<playlist.snapshot[snapshot].hasTracks.length;i++){
                    const track1 =await Track.getTrack(playlist.snapshot[snapshot].hasTracks[i]);
                    const artistId = track1.artistId;
                    const albumId =track1.albumId;
                    const album =await Album.getAlbumById(albumId);
                    const artist =await Artist.getArtist(artistId);
                    tracks.push({trackid:track1.id,name:track1.name,artistId:artistId,artistName:artist.name,albumId:albumId,albumName:album.name});                
                }
            }
            else{
                 for(let i=0;i <playlist.snapshot[playlist.snapshot.length-1].hasTracks.length;i++ ){
                    const track1 =await Track.getTrack(playlist.snapshot[playlist.snapshot.length-1].hasTracks[i]);
                    const artistId = track1.artistId;
                    const albumId =track1.albumId;
                    const album =await Album.getAlbumById(albumId);
                    const artist =await Artist.getArtist(artistId);
                    tracks.push({trackid:track1.id,name:track1.name,artistId:artistId,artistName:artist.name,albumId:albumId,albumName:album.name});                
                }
            }
            playlistJson.push({id:playlist._id,type:playlist.type,name:playlist.name,collaborative:playlist.collaborative,isPublic:playlist.isPublic,images:playlist.images,tracks:tracks});
            return playlistJson;
        } 
            return 0;
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
    const Playlist=new playlistDocument({
        _id: mongoose.Types.ObjectId(),
        type:"playlist" ,
        collaborative:false ,
        name:playlistName ,
        isPublic:true ,
        isPublic:true ,
        snapshot:[]
    })
    await Playlist.save();
    
    const album1=new albumDocument({
        name:"album1"
    }) 
    await album1.save();
    const album2=new albumDocument({
        name:"album2"
    })
    await album2.save();
    const album3=new albumDocument({
        name:"album3"
    }) 
    await album3.save();
    const album4=new albumDocument({
        name:"album4"
    }) 
    await album4.save();
    const artist1=new artistDocument({
        name:"artist1"
    }) 
    await artist1.save();
    const artist2=new artistDocument({
        name:"artist4"
    }) 
    await artist2.save();
    const track1=new trackDocument({
        name:"track1",
        albumId:album1._id,
        artistId:artist1._id
    })
    await track1.save();
    const track2=new trackDocument({
        name:"track2",
        albumId:album2._id,
        artistId:artist1._id
    
    })
    await track2.save();
    const track3=new trackDocument({
        name:"track3",
        albumId:album3._id,
        artistId:artist1._id
    
    })
    await track3.save();
    const track4=new trackDocument({
        name:"track4",
        albumId:album4._id,
        artistId:artist2._id
    
    })
    await track4.save();
    Playlist.snapshot.push({hasTracks:[]})
    Playlist.snapshot[0].hasTracks.push(track2._id);
    Playlist.snapshot[0].hasTracks.push(track4._id);
    Playlist.snapshot[0].hasTracks.push(track3._id);
    Playlist.snapshot[0].hasTracks.push(track1._id);
    await Playlist.save();
    return Playlist;
    },
    findIndexOfTrackInPlaylist: async function(trackId,tplaylist) {
        for(let i=0;i <tplaylist.hasTracks.length;i++ ){
            if(tplaylist.hasTracks[i].trackId==trackId) 
              return i;     
        }
        return -1
    },
    //to delete playlist
    
    deletePlaylist  : async function(user,playlistId){
        const playlist =  await Playlist.getPlaylist(playlistId);
        if(playlist){             
            const userHasPlaylist = await Playlist.checkIfUserHasPlaylist(user, playlistId);
                if(userHasPlaylist){
                     // connect to db and find play with the same id then return it as json file
                     for(let i=0;i <user.createPlaylist.length;i++ ){
                  
                        if(user.createPlaylist[i].playListId == playlistId){
                           
                            user.createPlaylist.splice(i,1);
                            await user.save();
                        }
                    }return await this.unfollowPlaylist(user,playlistId);
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
        followPlaylits: async function(user,playlistID,isPrivate){
            const followedBefore= this.checkFollowPlaylistByUser(user,playlistID)
            if (followedBefore){
                return 0;
            }
            if (!isPrivate|| isPrivate=='false'){
                isPrivate=false;
            }
            else
                isPrivate=true;
            if(user.followPlaylist){
                user.followPlaylist.push({
                    playListId: playlistID,
                    isPrivate:isPrivate
                });
                await user.save();
                return 1;
            }
            user.followPlaylist = [];
            user.followPlaylist.push({
                playListId: playlistID,
                isPrivate:isPrivate
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
            if(len==0){return 0;}
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

