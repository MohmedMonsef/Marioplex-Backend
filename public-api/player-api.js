const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
const Playlist = require('./playlist-api');
const Album = require('./album-api');

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
            
    },

    // to fill queue
    createQueue: async function(user,isPlaylist,id,trackID)
    {
       
       
        if(isPlaylist=='true')
        {
          const queueFiller= await Playlist.getPlaylist(id);
           if(!queueFiller) return 0; //if this is not a playlist
            const   indexOfTrack = await Playlist.findIndexOfTrackInPlaylist(trackID,queueFiller)
           if( indexOfTrack == -1) return 0;
           user.tracksInQueue=[];
        var j=0;
        for(let i=indexOfTrack-1;i >=0;i-- ){
            user.tracksInQueue.push({
                trackId: queueFiller.hasTracks[i],
                isQueue: false,
                inedex : j,
                isNextToCurrent:false
            });
            await user.save().catch();
            j++
        }
        for(let i=queueFiller.hasTracks.length-1;i>=indexOfTrack+1;i-- ){
            user.tracksInQueue.push({
                trackId: queueFiller.hasTracks[i],
                isQueue: false,
                inedex : j,
                isNextToCurrent:true
            });
            await user.save().catch();
            j++
        }
        user.tracksInQueue.push({
            trackId: queueFiller.hasTracks[indexOfTrack],
            isQueue: false,
            inedex : j,
            isNextToCurrent:false
        });
        await user.save().catch();
        return 1;
        }
        
        const queueFiller= await Album.getAlbumById(id);
        if(!queueFiller) return 0;  //if this is not a album
        const indexOfTrack = Album.findIndexOfTrackInAlbum(trackID,queueFiller);
        if(indexOfTrack ==-1) return 0;  
        user.tracksInQueue=[];
        var j=0;
        for(let i=indexOfTrack-1;i <=0;i-- ){
            user.tracksInQueue.push({
                trackId: queueFiller.hasTracks[i],
                isQueue: false,
                inedex : j,
                isNextToCurrent:false
            });
            await user.save().catch();
            j++
        }
        for(let i=queueFiller.hasTracks.length-1;i <=indexOfTrack+1;i-- ){
            user.tracksInQueue.push({
                trackId: queueFiller.hasTracks[i],
                isQueue: false,
                inedex : j,
                isNextToCurrent:true
            });
            await user.save().catch();
            j++
        }
        user.tracksInQueue.push({
            trackId: queueFiller.hasTracks[indexOfTrack],
            isQueue: false,
            inedex : j,
            isNextToCurrent:false
        });
        await user.save().catch();
        return 1;
    }

    
}


module.exports = Player;