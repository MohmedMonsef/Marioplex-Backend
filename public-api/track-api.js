const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');



const Track = {

    /** 
    *  get track by id
    * @param : track-id {mongoose ObjectId}
    **/
    getTrack: async function(trackID) {

        // connect to db and find track with the same id then return it as json file
        // if found return track else return 0
        const track = await trackDocument.findById(trackID, (err, track) => {
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
    getFullTrack: async function(trackID, user) {

        const track = await this.getTrack(trackID);
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
        const isLiked = await this.checkIfUserLikeTrack(user, trackID) ? true : false;
        
        return { track: track, isLiked: isLiked, album: { name: album.name, _id: album._id, artist: { name: artist.Name, _id: artist._id } } }
    },
    /** 
    *  get several tracks
    * @param : array of track ids
    */
    getTracks: async function(tracksIDs, user) {
        let tracks = [];
        for (let trackID of tracksIDs) {
            let track = await this.getFullTrack(trackID, user);
            if (!track) continue
            tracks.push(track);
        }
        return tracks;

    },
    /** 
    *  get audio features for track
    * @param : track-id {mongoose ObjectId}
    **/
    getAudioFeaturesTrack: async function(trackID) {
        const track = await this.getTrack(trackID);
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
    getAudioFeaturesTracks: async function(tracksIDs) {

        let audioFeatures = {};
        var count = 0;
        for (let trackID of tracksIDs) {
            const audioFeature = await this.getAudioFeaturesTrack(trackID);
            if (audioFeature) {
                audioFeatures[trackID] = audioFeature;
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
    checkIfUserLikeTrack: function(user, trackID) {

        const tracksUserLiked = user.like;
        
        if (tracksUserLiked) {
            return tracksUserLiked.find(track => track.trackId + 1 == trackID + 1);
        }
        return 0;
    },
    /** 
    * user like track
    * @param : user {mongoose object}
    * @param : track-id {mongoose ObjectId}
    **/
    likeTrack: async function(user, trackID) {

        // check if user already liked the track
        // if not found then add track.track_id to user likes and return the updated user
        // else return 0 as he already like the track
        const track = await this.getTrack(trackID);
        if (!track) return 0;
        if (!track.like) track.like = 0;

        if (this.checkIfUserLikeTrack(user, trackID)) {
            return 0;
        }
        if (user.like) {
            user.like.push({
                trackId: trackID
            });

            await user.save();
            track.like += 1;
            // save track
            await track.save().catch();
            return 1;

        }
        user.like = [];
        user.like.push({
            trackId: trackID
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
    unlikeTrack: async function(user, trackID) {
        // check if user already liked the track
        // if user.like.contains({track_id:track.track_id})
        // if  found then remove track.track_id from user likes and return the updated user
        // else return 0 as he didn't like the track
        const track = await this.getTrack(trackID);
        if (!track) return 0;
        if (!track.like) track.like = 0;

        if (!this.checkIfUserLikeTrack(user, trackID)) {
            return 0;
        }
        for (let i = 0; i < user.like.length; i++) {
            if (user.like[i].trackId == trackID) {
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
    * @param : artistID {mongoose object ID}
    * @param : albumID {mongoose object ID}
    * @param : duration {Number} 
    **/
    createTrack: async function(url, Name, TrackNumber, AvailableMarkets, artistID, albumID, duration) {
        let track = new trackDocument({
            url: url,
            images: [],
            duration:duration,
            availableMarkets: AvailableMarkets,
            trackNumber: TrackNumber,
            name: Name,
            artistId: artistID,
            albumId: albumID,
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
            like: 0

        });
        await track.save();
        
        return track;

    }


}

module.exports = Track;