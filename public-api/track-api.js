const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');


// initialize db 
const connection=require('../DBconnection/connection');

 const Track =  {
    
    // get track by id
    // params : track-id
    getTrack  : async function(trackID){
        
            // connect to db and find track with the same id then return it as json file
            // if found return track else return 0
            const track = await trackDocument.findById(trackID,(err,track)=>{
                if(err) return 0;
                return track;
            }).catch((err)=> 0);
            return track;
            

    },

    // check if user liked a track
    checkIfUserLikeTrack: function(user,trackID){
        
        const tracksUserLiked = user.like;
        // if user.like.contains({track_id:track.track_id})
        if(tracksUserLiked){
           return  tracksUserLiked.find(track => track.trackId == trackID);
        }
        return 0;
    },
    //user like track by track-id
    //params : user , track-id
     likeTrack : async function(user,trackID){
        // check if user already liked the track
        // if not found then add track.track_id to user likes and return the updated user
        // else return 0 as he already like the track
        if(this.checkIfUserLikeTrack(user,trackID)){
            return 0;
        }
        if(user.like){
            user.like.push({
                trackId: trackID
            });
            await user.save();
            return 1;
            
        }
        user.like = [];
        user.like.push({
            trackId: trackID
        });
        await user.save().catch();
        return 1;

    },

    //user unlike track by track-id
    //params : user , track-id
     unlikeTrack: async function(user,trackID){
        // check if user already liked the track
        // if user.like.contains({track_id:track.track_id})
        // if  found then remove track.track_id from user likes and return the updated user
        // else return 0 as he didn't like the track
        if(!this.checkIfUserLikeTrack(user,trackID)){
            return 0;
        }
        for(let i=0;i <user.like.length;i++ ){
            if(user.like[i].trackId == trackID){
                user.like.splice(i,1);
            }
        }
        await user.save().catch();
        return 1;
    },
      // create Track for an artist
    // params : artist-id
    createTrack  : async function(url,Name,TrackNumber,AvailableMarkets,artistID){
        let track=new trackDocument({
            externalId:url ,
            availableMarkets:AvailableMarkets ,
            trackNumber:TrackNumber ,
            name:Name,
            artistId:artistID
        }); 
       await track.save();
       console.log(track);
       return track;
      
}


}

module.exports = Track;


