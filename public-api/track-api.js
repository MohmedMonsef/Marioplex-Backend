const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');



const Track = {

    // get track by id
    // params : track-id
    getTrack: async function(trackID) {

        // connect to db and find track with the same id then return it as json file
        // if found return track else return 0
        const track = await trackDocument.findById(trackID, (err, track) => {
            if (err) return 0;
            return track;
        }).catch((err) => 0);
        return track;


    },
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
        //console.log(user)
        //console.log(isLiked);
        return { track: track, isLiked: isLiked, album: { name: album.name, _id: album._id, artist: { name: artist.Name, _id: artist._id } } }
    },
    // get several tracks
    // params : array of track ids
    getTracks: async function(tracksIDs, user) {
        let tracks = [];
        for (let trackID of tracksIDs) {
            let track = await this.getFullTrack(trackID, user);
            if (!track) continue
            tracks.push(track);
        }
        return tracks;

    },
    // get audio feature track
    // params :  trackid
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
    // get audio of features of several tracks 
    // params : trackIDs
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

    // check if user liked a track
    checkIfUserLikeTrack: function(user, trackID) {

        const tracksUserLiked = user.like;
        //console.log(tracksUserLiked)
        // if user.like.contains({track_id:track.track_id})
        if (tracksUserLiked) {
            return tracksUserLiked.find(track => track.trackId + 1 == trackID + 1);
        }
        return 0;
    },
    //user like track by track-id
    //params : user , track-id
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

    //user unlike track by track-id
    //params : user , track-id
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
    // create Track for an artist
    // params : artist-id
    createTrack: async function(url, Name, TrackNumber, AvailableMarkets, artistID, albumID, duration) {
        let track = new trackDocument({
            url: url,
            images: [],
            duration,
            duration,
            availableMarkets: AvailableMarkets,
            trackNumber: TrackNumber,
            name: Name,
            artistId: artistID,
            albumId: albumID,
            discNumber: 1,
            explicit: false,
            type: "Track",
            acousticness: 10,
            danceability: 23,
            energy: 100,
            instrumentalness: 4,
            key: 90,
            liveness: 25,
            loudness: 70,
            mode: 56,
            speechiness: 67,
            tempo: 76,
            timeSignature: Date.now(),
            valence: 70,
            like: 0

        });
        await track.save();
        //console.log(track);
        return track;

    }


}

module.exports = Track;