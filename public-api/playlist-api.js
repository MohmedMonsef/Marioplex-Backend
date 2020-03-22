const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');


// initialize db 
const connection=require('../DBconnection/connection');
const mongoose = require('mongoose');

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
        isPublic:"false" ,
        hasTracks:[]
    })
    await Playlist.save();
    /////should be deleted 
    const album1=new albumDocument({
        name:"hjhhdhhjdhjdhjfdjhfjhhjd",
        
      });
      await album1.save();
      const album2=new albumDocument({
        name:"hjhhdhhjdhjdhjfdjhfjhhjd",
        
      });
      await album2.save();
      const album3=new albumDocument({
        name:"hjhhdhhjdhjdhjfdjhfjhhjd",
        
      });
      await album3.save();
      const album4=new albumDocument({
        name:"hjhhdhhjdhjdhjfdjhfjhhjd",
        
      });
      await album4.save();
    const track1 =new trackDocument({
            _id: mongoose.Types.ObjectId(),
            availableMarkets:"gdffffffffffffffffh" ,
            discNumber:656,
            trackNumber:54543 ,
            durationMs:5445 ,
            explicit: true ,
            previewURL:'hjfhjwedf' ,
            popularity:689,
            name:'frytwuy',
            type:'track' ,
            isPlayable:true ,
            acousticness:78 ,
            analysisURL:'ewqiudew' ,
            danceability:7989 ,
            energy:7897898 ,
            instrumentalness:7828 ,
            key:9090,
            albumId:album1._id,
            liveness:0 ,
            loudness:97 ,
            mode:90 ,
            speechiness:90 ,
            tempo:9090 ,
            timeSignature:Date.now() ,
            valence:8337
          })
          await track1.save();

          
    const track2 =new trackDocument({
        _id: mongoose.Types.ObjectId(),
        availableMarkets:"gdffffffffffffffffh" ,
        discNumber:656,
        trackNumber:54543 ,
        durationMs:5445 ,
        explicit: true ,
        previewURL:'hjfhjwedf' ,
        popularity:689,
        name:'frytwuy',
        type:'track' ,
        isPlayable:true ,
        acousticness:78 ,
        analysisURL:'ewqiudew' ,
        danceability:7989 ,
        energy:7897898 ,
        instrumentalness:7828 ,
        key:9090,
        albumId:album1._id,
        liveness:0 ,
        loudness:97 ,
        mode:90 ,
        speechiness:90 ,
        tempo:9090 ,
        timeSignature:Date.now() ,
        valence:8337
      })
      await track2.save();
        
    const track3 =new trackDocument({
        _id: mongoose.Types.ObjectId(),
        availableMarkets:"gdffffffffffffffffh" ,
        discNumber:656,
        trackNumber:54543 ,
        durationMs:5445 ,
        explicit: true ,
        previewURL:'hjfhjwedf' ,
        popularity:689,
        name:'frytwuy',
        type:'track' ,
        isPlayable:true ,
        acousticness:78 ,
        analysisURL:'ewqiudew' ,
        danceability:7989 ,
        energy:7897898 ,
        instrumentalness:7828 ,
        key:9090,
        albumId:album1._id,
        liveness:0 ,
        loudness:97 ,
        mode:90 ,
        speechiness:90 ,
        tempo:9090 ,
        timeSignature:Date.now() ,
        valence:8337
      })

      await track3.save(); 
    const track4 =new trackDocument({
        _id: mongoose.Types.ObjectId(),
        availableMarkets:"gdffffffffffffffffh" ,
        discNumber:656,
        trackNumber:54543 ,
        durationMs:5445 ,
        explicit: true ,
        previewURL:'hjfhjwedf' ,
        popularity:689,
        name:'frytwuy',
        type:'track' ,
        isPlayable:true ,
        acousticness:78 ,
        analysisURL:'ewqiudew' ,
        danceability:7989 ,
        energy:7897898 ,
        instrumentalness:7828 ,
        key:9090,
        albumId:album1._id,
        liveness:0 ,
        loudness:97 ,
        mode:90 ,
        speechiness:90 ,
        tempo:9090 ,
        timeSignature:Date.now() ,
        valence:8337
      })

      await track4.save(); 
    const track5 =new trackDocument({
        _id: mongoose.Types.ObjectId(),
            availableMarkets:"gdffffffffffffffffh" ,
            discNumber:656,
            trackNumber:54543 ,
            durationMs:5445 ,
            explicit: true ,
            previewURL:'hjfhjwedf' ,
            popularity:689,
            name:'frytwuy',
            type:'track' ,
            isPlayable:true ,
            acousticness:78 ,
            analysisURL:'ewqiudew' ,
            danceability:7989 ,
            energy:7897898 ,
            instrumentalness:7828 ,
            key:9090,
            albumId:album1._id,
            liveness:0 ,
            loudness:97 ,
            mode:90 ,
            speechiness:90 ,
            tempo:9090 ,
            timeSignature:Date.now() ,
            valence:8337
      })

      await track5.save();

   
    Playlist.hasTracks.push({
        trackId : track1._id
    });
    await Playlist.save();
    Playlist.hasTracks.push({
        trackId : track2._id
    });
    await Playlist.save();
    Playlist.hasTracks.push({
        trackId : track3._id
    });
    await Playlist.save();
    Playlist.hasTracks.push({
        trackId : track4._id
    });
    await Playlist.save();
    //////should be deleted
    
    
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
        checkFollowPlaylistByUser:async function(user,playlistID){
        
            const followedplaylists = user.followPlaylist;
            
            if(followedplaylists){
               const followed = await followedplaylists.find(playlist => playlist.playListId == playlistID);
                return followed
            }
            return 0;
        },
        //user follow playlist by playlist-id
        //params : user , playlist-id
        followPlaylist:async function(user,playlistID){
            const followedBefore=await this.checkFollowPlaylistByUser(user,playlistID)
            if (followedBefore){
                return 0;
            }
            if(user.followPlaylist){
                user.followPlaylist.push({
                    playListId: playlistID
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
            const followedBefore=await this.checkFollowPlaylistByUser(user,playlistID)
            if (!followedBefore){
                return 0;
            }
            if(user.followPlaylist){
                for(let i=0;i <user.followPlaylist.length;i++ ){
                    if(user.followPlaylist[i].playlistId == playlistID){
                        user.followPlaylist.splice(i,1);
                        await user.save();
                        return 1;
                    }
                }
            }
            return 0;
        },


    }



module.exports = Playlist;

