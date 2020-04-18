const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const mongoose = require('mongoose')
const checkMonooseObjectID = require('../validation/mongoose-objectid')
const Image = require('./image-api')
const Track = {

    /** 
    *  get track by id
    * @param : track-id {mongoose ObjectId}
    **/
    getTrack: async function(trackId) {
       
        // connect to db and find track with the same id then return it as json file
        // if found return track else return 0
        if(!checkMonooseObjectID([trackId])) return 0;
        const track = await trackDocument.findById(trackId, (err, track) => {
            if (err) return 0;
            return track;
        }).catch((err) => 0);
        return track;


    },
    /** 
    *  get full track object by id
    * @param : track-id {mongoose ObjectId}
    * @param : user {user object}
    **/
    getFullTrack: async function(trackId, user) {
        if(!checkMonooseObjectID([trackId])) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0; //not found
        // get both album and artist of the track
        const album = await albumDocument.findById(track.albumId);
        if (!album) return 0; //not found
        album.popularity++;
        await album.save();
        const artist = await artistDocument.findById(track.artistId);
        if (!artist) return 0;
        artist.popularity++;
        await artist.save();
        const isLiked = await this.checkIfUserLikeTrack(user, trackId) ? true : false;
        
        return { track: track, isLiked: isLiked, album: { name: album.name, _id: album._id, artist: { name: artist.Name, _id: artist._id } } }
    },
    /** 
    *  get several tracks
    * @param : array of track ids
    */
    getTracks: async function(trackIds, user) {
        if(!checkMonooseObjectID(trackIDs)) return 0;
        let tracks = [];
        for (let trackId of trackIds) {
            let track = await this.getFullTrack(trackId, user);
            if (!track) continue
            tracks.push(track);
        }
        return tracks;

    },
    /** 
    *  get audio features for track
    * @param : track-id {mongoose ObjectId}
    **/
    getAudioFeaturesTrack: async function(trackId) {
        if(!checkMonooseObjectID([trackId])) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0;
        const audioFeatures = {

            durationMs: track.durationMs,
            explicit: track.explicit,
            acousticness: track.acousticness,
            danceability: track.danceability,
            energy: track.danceability,
            instrumentalness: track.instrumentalness,
            key: track.key,
            liveness: track.liveness,
            loudness: track.loudness,
            mode: track.mode,
            speechiness: track.speechiness,
            tempo: track.tempo,
            valence: track.valence
        }
        return audioFeatures;
    },
    /** 
    *  get audio features for tracks
    * @param : track-ids {mongoose ObjectId}
    **/
    getAudioFeaturesTracks: async function(trackIds) {
        if(!checkMonooseObjectID(trackIDs)) return 0;
        let audioFeatures = {};
        var count = 0;
        for (let trackId of trackIds) {
            const audioFeature = await this.getAudioFeaturesTrack(trackId);
            if (audioFeature) {
                audioFeatures[trackId] = audioFeature;
                count++;
            }
        }

        if (count)
            return audioFeatures;
        return 0;
    },

    /** 
    *  check if user like track
    * @param : user {mongoose object}
    * @param : track-id {mongoose ObjectId}
    **/
    checkIfUserLikeTrack: function(user, trackId) {
        if(!checkMonooseObjectID([trackId])) return 0;
        const tracksUserLiked = user.like;
        
        if (tracksUserLiked) {
            return tracksUserLiked.find(track => String(track.trackId) == String(trackId) );
        }
        return 0;
    },
    /** 
    * user like track
    * @param : user {mongoose object}
    * @param : track-id {mongoose ObjectId}
    **/
    likeTrack: async function(user, trackId) {

        // check if user already liked the track
        // if not found then add track.track_id to user likes and return the updated user
        // else return 0 as he already like the track
        if(!checkMonooseObjectID([trackId])) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0;
        if (!track.like) track.like = 0;

        if (this.checkIfUserLikeTrack(user, trackId)) {
            return 0;
        }
        if (user.like) {
            user.like.push({
                trackId: trackId
            });

            await user.save();
            track.like += 1;
            // save track
            await track.save().catch();
            return 1;

        }
        user.like = [];
        user.like.push({
            trackId: trackId
        });
        await user.save().catch();

        // add count to the like attribute of track
        track.like += 1;
        // save track
        await track.save().catch();
        return 1;

    },

    /** 
    * user unlike track
    * @param : user {mongoose object}
    * @param : track-id {mongoose ObjectId}
    **/
    unlikeTrack: async function(user, trackId) {
        // check if user already liked the track
        // if user.like.contains({track_id:track.track_id})
        // if  found then remove track.track_id from user likes and return the updated user
        // else return 0 as he didn't like the 
        if(!checkMonooseObjectID([trackId])) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0;
        if (!track.like) track.like = 0;

        if (!this.checkIfUserLikeTrack(user, trackId)) {
            return 0;
        }
        for (let i = 0; i < user.like.length; i++) {
            if (String(user.like[i].trackId) == String(trackId)) {
                user.like.splice(i, 1);
                break;
            }
        }
        // decrement track likes by one
        track.like -= 1;

        await user.save().catch();
        // save track
        await track.save().catch();
        return 1;
    },
    /** 
    * user like track
    * @param : url {string} url of string
    * @param : trackNumber {Number} number of track in album
    * @param : availableMarkets {Array} markets
    * @param : artistId {mongoose object ID}
    * @param : albumId {mongoose object ID}
    * @param : duration {Number} 
    **/
    createTrack: async function(url, Name, trackNumber, availableMarkets, artistId, albumId, duration,key,keyId) {
        //if(typeof(url) != "string" || typeof(Name) != "string" || typeof(trackNumber) != "number" || typeof(duration) != "number") return 0;
       
        if(!checkMonooseObjectID([artistId,albumId])) return 0;
        if(!availableMarkets) availableMarkets = [];
        let track = new trackDocument({
            url: url,
            images: [],
            duration:duration,
            availableMarkets: availableMarkets,
            trackNumber: trackNumber,
            name: Name,
            artistId: artistId,
            albumId: albumId,
            discNumber: 1,
            explicit: false,
            type: "Track",
            acousticness: Math.floor(Math.random()*100),
            danceability:  Math.floor(Math.random()*100),
            energy:  Math.floor(Math.random()*100),
            instrumentalness:  Math.floor(Math.random()*100),
            key:  Math.floor(Math.random()*100),
            liveness:  Math.floor(Math.random()*100),
            loudness:  Math.floor(Math.random()*100),
            mode:  Math.floor(Math.random()*100),
            speechiness:  Math.floor(Math.random()*100),
            tempo:  Math.floor(Math.random()*100),
            timeSignature: Date.now(),
            valence:  Math.floor(Math.random()*100),
            like: 0,
            key:key,
            keyId:keyId

        });
        await track.save();
        
        return track;

    },
    /**
     * 
     * @param {String} userId id of the user who own the track 
     * @param {String} trackId id of the track to be deleted
     * @returns {boolean}
     */
    deleteTrack: async function(userId,trackId){
        if(!checkMonooseObjectID([userId,trackId])) return 0;
        const user = await userDocument.findById(userId);
        if(!user) return 0;
        const track = await this.getTrack(trackId);
        if(!track) return 0;
        // check if user is the artist that own the track
        const artist = await artistDocument.findOne({ userId: userId });
        if(!artist) return 0;
        // if artist dont own track then return 0
        if(String(artist._id) != String(track.artistId)) return 0;
        // delete track from artist,album,playlists,tracks,gridfs,track images
        // delete from artist
       
        if(!artist.addTracks)return 0;
        for(let i=0;i<artist.addTracks.length;i++){
            if(String(artist.addTracks[i].trackId) == trackId){
                artist.addTracks.splice(i,1);
                break;
            }
        }
        await artist.save();
        // delete from album
        const album = await albumDocument.findById(track.albumId);
        
        if(!album) return 0;
        if(!album.hasTracks) return 0;
        for(let i=0;i<album.hasTracks.length;i++){
            if(String(album.hasTracks[i].trackId) == trackId){
                album.hasTracks.splice(i,1);
                break;
            }
        }
        await album.save();
        // delete from all playlist in the database
        await playlistDocument.find({},async (err,files)=>{
            if(err) return 0;
            for(let playlist of files){
                if(!playlist.hasTracks)continue;
                for(let i=0;i<playlist.hasTracks.length;i++){
                    if(String(playlist.hasTracks[i]) == trackId){
                        playlist.hasTracks.splice(i,1);
                        break;
                    }
                }
                await playlist.save();
            }
        });
        // delete track images
        if(!track.images) track.images = [];
        // delete image from gridfs
        await Image.deleteImages(userId,trackId,'track');
        // delete from tracks
        await trackDocument.findByIdAndDelete(trackId);
        // delete from gridfs
        // await gfsTracks.files.re44({"metadata.trackId":mongoose.Types.ObjectId(trackId)},(err,files)=>{
        //     console.log(files);
        // })
        await gfsTracks.files.find({"metadata.trackId":mongoose.Types.ObjectId(trackId)}).toArray(async function (err, files) {
            if(files){
                //console.log(files);
                for(let file of files){
                   // console.log(file,file._id)
                    //await gfsTracks.chunks.deleteMany({files_id:mongoose.Types.ObjectId(file._id)})
                    await  gfsTracks.db.collection('tracks.chunks').remove({files_id:mongoose.Types.ObjectId(file._id)});
                    await gfsTracks.files.deleteMany({"metadata.trackId":mongoose.Types.ObjectId(trackId)})
                }
            }
        })
       // await gfsTracks.chunks.deleteMany({"files_id":mongoose.Types.ObjectId(trackId)})

        return 1;

    }


}

module.exports = Track;