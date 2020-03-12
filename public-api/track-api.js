const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/DB');

// initialize db 
require('../config/initialize-DB');

class Track {
    
    // get track by id
    // params : track-id
    async getTrack(trackID){
        
            // connect to db and find track with the same id then return it as json file
            // if found return track else return 0
            const track = await trackDocument.findById(trackID,(err,track)=>{
                if(err) return 0;
                return track;
            }).catch((err)=> 0);
            return track;
            

    }

    //user like track by track-id
    //params : user , track-id
    async likeTrack(user,trackID){
        // get track
        const track = this.getTrack(trackID);
        // check if user already liked the track
        // if user.like.contains({track_id:track.track_id})
        // if not found then add track.track_id to user likes and return the updated user
        // else return 0 as he already like the track
    }

    //user unlike track by track-id
    //params : user , track-id
    async unlikeTrack(user,trackID){
        // get track
        const track = this.getTrack(trackID);
        // check if user already liked the track
        // if user.like.contains({track_id:track.track_id})
        // if  found then remove track.track_id from user likes and return the updated user
        // else return 0 as he didn't like the track
    }


}

module.exports = Track;


