const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
const Playlist = require('./playlist-api');
const Album = require('./album-api');
const Track =require('./track-api')

const Player = {

    // get next and prev track from playlist or album object 
    getPrevAndNext: function(hasTracks,trackID){
            for(let i=0;i<hasTracks.length;i++){
                if(trackID == hasTracks[i].trackId){
                    console.log(trackID,hasTracks[i].trackId)
                    return {
                        "next_track":i+1<hasTracks.length?hasTracks[i+1]:undefined,
                        "prev_track":i-1>=0?hasTracks[i-1]:undefined,
                    }
                }
            }
            return {
                "next_track":undefined,
                "prev_track":undefined,
            }
           
    },

    // update user player object each time he plays new track
    setPlayerInstance: async function(user,isPlaylist,id,trackID){
    
        // first check if there is a queue
        if(user.tracksInQueue){
            // get next from the queue directly
           // get next track and prev Track in playlist by checking for id greater than track id
           const {"next_track":nextTrack,"prev_track":prevTrack} = this.getPrevAndNext(user.tracksInQueue,trackID);
           
           // update user player info 
           user.player["next_track"] = nextTrack ? nextTrack.trackId:undefined;
           user.player["prev_track"] = prevTrack? prevTrack.trackId:undefined;
           user.player["current_track"] = trackID;
           await user.save();
           return 1;
        }else{
            // get next and previous form playlist or album he is currently in
    
        // if the new track the user is playing from a plylist then get track and get it's previus and next from the playlist
        if(isPlaylist){
            // get playlist
            const playlist = await Playlist.getPlaylist(id);
            console.log(playlist);
            if(!playlist) return 0; // no playlist was found
            // get next track and prev Track in playlist by checking for id greater than track id
            const {"next_track":nextTrack,"prev_track":prevTrack} = this.getPrevAndNext(playlist.hasTracks,trackID);
           
            // update user player info 
            user.player["next_track"] = nextTrack ? nextTrack.trackId:undefined;
            user.player["prev_track"] = prevTrack? prevTrack.trackId:undefined;
            user.player["current_track"] = trackID;
            await user.save();
            return 1;

        }else{
            // the track is from album 
            // get album
            const album = await Album.getAlbumById(id);
            if(!album) return 0; // no playlist was found
            // get next track and prev track in album by checking for id greater than track id
            const {"next_track":nextTrack,"prev_track":prevTrack} = this.getPrevAndNext(album.hasTracks,trackID);
             // update user player info 
             user.player["next_track"] = nextTrack ? nextTrack.trackId:undefined;
             user.player["prev_track"] = prevTrack? prevTrack.trackId:undefined;
             user.player["current_track"] = trackID;
            await user.save();
            return 1;
        }
    }
            
    },
    // add  a track to user recent tracks
    addRecentTrack: async function(user,trackID){
        if(user.playHistory){
            if(user.playHistory.length > 50)user.playHistory.pop();
            user.playHistory.unshift({
                trackId:trackID
            });
            await user.save();
            return 1;
        }else{
            user.playHistory = [];
            user.playHistory.push({
                trackId:trackID
            });
            await user.save();
            return 1;
        }
        
    },
    // clear user recent played track history
    clearRecentTracks: async function(user){
        user.playHistory = [];
        await user.save();
        return 1;
    },
    // get recent tracks played by user
    getRecentTracks:  function(user,limit){
        limit = limit || 50;
        let tracks= [];
        if(!user.playHistory) return tracks;
        for(let i=0;i<Math.min(user.playHistory.length,limit);i++) tracks.push(user.playHistory[i]);
        return tracks;
    },

    // to fill queue
    createQueue: async function(user,isPlaylist,id,trackID)
    {
       
       if(isPlaylist){
            const playlist = await Playlist.getPlaylist(id);
            if(!playlist) return 0;
            user.queue = {};
            user.queue.index = 0;
            user.queue.tracksInQueue = [];
            if(!playlist.hasTracks){
                await user.save();
                return 1;
            }
            let i=0;
            for(let track of playlist.hasTracks){
                if(trackID == track.trackId){
                        user.queue.index = i;
                }
                user.tracksInQueue.push({
                    trackId : track.trackId,
                    isQueue: false

                });
                i++;
            }

            await user.save();
            return 1;
       }else{
        const album = await Album.getAlbumById(id);
        if(!album) return 0;
        user.queue = {};
        user.queue.index = 0;
        user.queue.tracksInQueue = [];
        if(!album.hasTracks){
            await user.save();
            return 1;
        }
        let i=0;
        for(let track of album.hasTracks){
            if(trackID == track.trackId){
                    user.queue.index = i;
            }
            user.tracksInQueue.push({
                trackId : track.trackId,
                isQueue: false

            });
            i++;
        }

        await user.save();
        return 1;
       }
        
        
    },

    addToQueue:async function(user,trackID){
       if(!user.queue){
           user.queue = {};
           user.queue.tracksInQueue = [{
               trackId:trackID,
               isQueue:true
           }];
           user.queue.index = 0;
           await user.save();
           return 1;
       }else{
           if(!user.queue.tracksInQueue){
            user.queue.tracksInQueue = [{
                trackId:trackID
            }];
            user.queue.index = 0;
            await user.save();
            return 1;
           }else{
               let index = user.queue.index;
               user.queue.tracksInQueue.splice(index,0,{
                   trackId:trackID,
                   isQueue:true
               });
               user.queue.index = index+1;
               await user.save();
               return 1;
           }
       }
    }

    //// when find next in is queue the frist one will take is his index is the frist bigger than current played
    // when get next 
    //1. find the frist track index bigger than the current and isQueue=true
        //2. then if found will delete this track from in queue
        //then if not found will search the frist index less than current isnext = 'true'
            // if found make isnext = 0 ; and player.last-form-source =id;
            //if not found will take the trackid its index before the last_from _source 
            // then make all tracks in queue isnext = 'true';
    // to get previous get the index bigger than me isnext= false & isqueue =false
    //and make current isnext =true 
    //if not found get the index 0
    
    // can add track muliple in queue

}


module.exports = Player;