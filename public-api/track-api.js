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
    // get several tracks
    // params : array of track ids
    getTracks : async function(tracksIDs){
            let tracks = {};
            for(let trackID of tracksIDs){
                tracks[trackID] = await this.getTrack(trackID);
                if(!tracks[trackID])return 0;
            }
            return tracks;
    },

    // get audio feature track
    // params :  trackid
    getAudioFeaturesTrack : async function(trackID){
        const track = await this.getTrack(trackID);
        if(!track)return 0;
        const audioFeatures = {
        
            durationMs:track.durationMs ,
            explicit:track.explicit ,
            acousticness:track.acousticness ,
            danceability:track.danceability ,
            energy:track.danceability ,
            instrumentalness:track.instrumentalness ,
            key:track.key ,
            liveness:track.liveness ,
            loudness:track.loudness ,
            mode:track.mode ,
            speechiness:track.speechiness ,
            tempo:track.tempo ,
            valence:track.valence
        }
        return audioFeatures;
    },
    // get audio of features of several tracks 
    // params : trackIDs
    getAudioFeaturesTracks : async function(tracksIDs){
        let audioFeatures = {};
        for(let trackID of tracksIDs){
            const audioFeature = await this.getAudioFeaturesTrack(trackID);
            if(!audioFeatures) return 0;
            audioFeatures[trackID] = audioFeature;
        }
        return audioFeatures;
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
    createTrack  : async function(url,Name,TrackNumber,AvailableMarkets,artistID,albumID){
        let track=new trackDocument({
            externalId:url ,
            availableMarkets:AvailableMarkets ,
            trackNumber:TrackNumber ,
            name:Name,
            artistId:artistID,
            albumId:albumID,
            discNumber:1 ,
            explicit:false ,
            type:"Track" ,
            acousticness:10 ,
            danceability:23 ,
            energy:100 ,
            instrumentalness:4 ,
            key:90 ,
            liveness:25 ,
            loudness:70 ,
            mode:56 ,
            speechiness:67 ,
            tempo:76 ,
            timeSignature:'2-1-2000' ,
            valence:70

        }); 
       await track.save();
       console.log(track);
       return track;
      
}


}

module.exports = Track;


