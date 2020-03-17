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
            
    }
}


module.exports = Player;