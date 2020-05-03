const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');


// initialize db 
const connection = require('../db-connection/connection');
const User = require('./user-api');
const Playlist = require('./playlist-api');
const Track=require('./track-api');
const checkMonooseObjectID = require('../validation/mongoose-objectid')
const Recommendation = {

    getSimilarTracks:async function(user){
        //HINTS
        // DONE - CASE (0) - ASSUMES Recently Played hisory and neighbours both exists
        //TO-DO - CASE (1) - ASSUMES Recently Played hisory NOT EXISTS and neighbours exists
        //TO-DO - CASE (2) - ASSUMES Recently Played hisory EXISTS and neighbours DOESN'T EXIST
        //TO-DO - CASE (3) - ASSUMES Recently Played hisory and neighbours both DOESN'T EXIST
        //create similar tracks array
        similarTracks=[];
        //get user tracks in recently played
        let recentlyPlayedTracks=[];
        for(var i=0;i<user.playHistory.length;i++){
            let track=await Track.getTrack(user.playHistory[i].trackId,user);
            if(track){
                recentlyPlayedTracks.push(track);
            }
        }
        //get neighborhood
        let neigbours =await this.createNeighbours(user);
        for(var i=0;i<neigbours.length;i++){
            let neighbourTracks=[];
            for(var j=0;j<neigbours[i].playHistory.length;j++){
                let track=await Track.getTrack(neigbours[i].playHistory[j].trackId,user);
                if(track){
                    neighbourTracks.push(track);
                }
            }
            let neighbourLikedTracks=await Playlist.getPlaylistTracks(neigbours[i].likesTracksPlaylist);
            for(var j=0;j<neighbourLikedTracks.length;j++){
                let track=await Track.getTrack(neighbourLikedTracks._id,user);
                if(track){
                    neighbourTracks.push(track);
                }
            }
            let retTracks=await this.getRecentlySimilarTracks(recentlyPlayedTracks,neighbourTracks);
            for(var k=0;k<retTracks.length;k++){
                similarTracks.push(retTracks[k]);
            }
        }
        similarTracks=removeDupliactes(similarTracks);
        if(similarTracks.length>50){similarTracks.slice(0,50)}
        return similarTracks;
    },
    getRecentlySimilarTracks:async function(recentlyPlayedTracks,neighbourTracks){

        let similarNeighbourTracks=[];
        for(var i=0;i<recentlyPlayedTracks.length;i++){
            let tracks=await this.getRelatedTracksToArray(recentlyPlayedTracks[i]._id,neighbourTracks);
            if(tracks){
                for(var j=0;j<tracks.length;j++){
                    similarNeighbourTracks.push(tracks[j]);
                    if(j>2){break;}
                }
            }
        }
        return removeDupliactes(similarNeighbourTracks);

    },
    getRelatedTracksToArray: async function(trackId,tracks) {
        if (!checkMonooseObjectID([trackId])) return 0;
        const track = await Track.getTrack(trackId);
        if (!track) return 0;
        if (!track.genre) return 0;
        let tracksRelated = [];
            if (!tracks) return 0;
            for (let trackFile of tracks) {
                if (tracksRelated.length > 10) return tracksRelated;
                if (!trackFile.genre) continue;
                if (String(trackFile._id) == trackId) continue;
                for (let i = 0; i < trackFile.genre.length; i++) {
                    if (track.genre.includes(trackFile.genre[i])) {
                        tracksRelated.push(trackFile);
                        break;
                    }
                }
            }
       
        if (tracksRelated.length == 0) return 0;
        return tracksRelated;
    },
    createNeighbours:async function(user){
        let neigbours=[];
        let topNeigbours=[];
        const similarityThreshold=30;
        let users=userDocument.find({});
        for(var i=0;i<users.length;i++){
            if(String(user._id)!=String(users[i]._id)){
                let similarity=this.calcSimilarity(user,users[i]);
                if(similarity>similarityThreshold){
                    neigbours.push({user:users[i],similarity:similarity});
                }
            }
        }
        neigbours.sort((a, b) => (a.similarity > b.similarity) ? -1 : 1);
        for(var i=0;i<neigbours.length;i++){
            topNeigbours.push(neigbours[i].user);
        }
        return topNeigbours;
    },
    calcSimilarity:async function(currentUser,otherUser){
        let numFollowArtists=0;
        let numLikedTracks=0;
        let numLikedAlbums=0;
        let numPlayhistory=0;
        //loop follow artists
        for(var i=0;i<currentUser.follow.length;i++){
            for(var j=0;j<otherUser.follow.length;j++){
                if(String(currentUser.follow[i].id)==String(otherUser.follow[j].id)){
                    numFollowArtists+=1;
                }
            }
        }
        //loop Liked Tracks
        let currentUserLikedTracks=await Playlist.getPlaylistTracks(currentUser.likesTracksPlaylist);
        let otherUserLikedTracks=await Playlist.getPlaylistTracks(otherUser.likesTracksPlaylist);
        if(currentUserLikedTracks.length!=0&&otherUserLikedTracks!=0)
        {
        for(var i=0;i<currentUserLikedTracks.length;i++){
            for(var j=0;j<otherUserLikedTracks.length;j++){
                if(String(currentUserLikedTracks[i]._id)==String(otherUserLikedTracks[j]._id)){
                    numLikedTracks+=1;
                }
            }
         }
        }
        //loop liked albums
        for(var i=0;i<currentUser.saveAlbum.length;i++){
            for(var j=0;j<otherUser.saveAlbum.length;j++){
                if(String(currentUser.saveAlbum[i].albumId)==String(otherUser.saveAlbum[j].albumId)){
                    numLikedAlbums+=1;
                }
            }
        }
        //loop playhistory tracks
        for(var i=0;i<currentUser.playHistory.length;i++){
            for(var j=0;j<otherUser.playHistory.length;j++){
                if(String(currentUser.playHistory[i].trackId)==String(otherUser.playHistory[j].trackId)){
                    numPlayhistory+=1;
                }
            }
        }
       avgLikedTracks=(currentUserLikedTracks.length!=0)?numLikedTracks/currentUserLikedTracks.length*1.0:0;
       avgLikedAlbums=(currentUser.saveAlbum.length!=0)?numLikedAlbums/currentUser.saveAlbum.length*1.0:0;
       avgFollowArtists=(currentUser.follow.length!=0)?numFollowArtists/currentUser.follow.length*1.0:0;
       avgFollowArtists=(currentUser.playHistory.length!=0)?numFollowArtists/currentUser.playHistory.length*1.0:0;
        
        similarity=(avgLikedTracks+avgLikedAlbums+avgFollowArtists+avgFollowArtists)*100.0/4.0;
        return similarity;
    }
    
}
module.exports = Recommendation;

 const removeDupliactes = (values) => {

        let newArray = [];
        let uniqueObject = {};
        if(!values) values=[];
        for (let i in values) {
            objTitle = values[i]['_id'];
            uniqueObject[objTitle] = values[i];
        }
    
        for (i in uniqueObject) {
            newArray.push(uniqueObject[i]);
        }
        return newArray;
    }