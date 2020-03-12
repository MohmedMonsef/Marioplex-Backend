class Track {
    
    // get track by id
    // params : track-id
    getTrack(trackID){
            // connect to db and find track with the same id then return it as json file
            // if found return track else return 0

    }

    //user like track by track-id
    //params : user , track-id
    likeTrack(user,trackID){
        // get track
        const track = this.getTrack(trackID);
        // check if user already liked the track
        // if user.like.contains({track_id:track.track_id})
        // if not found then add track.track_id to user likes and return the updated user
        // else return 0 as he already like the track
    }

    //user unlike track by track-id
    //params : user , track-id
    unlikeTrack(user,trackID){
        // get track
        const track = this.getTrack(trackID);
        // check if user already liked the track
        // if user.like.contains({track_id:track.track_id})
        // if  found then remove track.track_id from user likes and return the updated user
        // else return 0 as he didn't like the track
    }


}

module.exports = Track;


