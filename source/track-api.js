const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const mongoose = require('mongoose')
const checkMonooseObjectID = require('../validation/mongoose-objectid')
const Image = require('./image-api')
const Track = {
    getTrackWithoutAuth: async function(trackId) {
        const track = await trackDocument.findById(trackId);
        if (!track) return 0;
        return track;
    },
    /** 
     *  get track by id
     * @param  {string} trackID - the track id 
     * @param {object} user 
     * @returns {object}
     */
    getTrack: async function(trackId, user) {

        // connect to db and find track with the same id then return it as json file
        // if found return track else return 0
        if (!checkMonooseObjectID([trackId])) return 0;
        const track = await trackDocument.findById(trackId, (err, track) => {
            if (err) return 0;
            return track;
        }).catch((err) => 0);
        if (!track) return 0;
        if (!user || user == undefined) return track;
        playable = await this.checkPlayable(user, trackId);
        let reTrack = {
            _id: track._id,
            url: track.url,
            images: track.images,
            duration: track.duration,
            availableMarkets: track.availableMarkets,
            trackNumber: track.trackNumber,
            name: track.name,
            artistId: track.artistId,
            albumId: track.albumId,
            discNumber: track.discNumber,
            explicit: track.explicit,
            type: track.type,
            acousticness: track.acousticness,
            danceability: track.danceability,
            energy: track.energy,
            instrumentalness: track.instrumentalness,
            key: track.key,
            liveness: track.liveness,
            loudness: track.loudness,
            mode: track.mode,
            speechiness: track.speechiness,
            tempo: track.tempo,
            timeSignature: track.timeSignature,
            valence: track.valence,
            like: track.like,
            keyId: track.keyId,
            genre: track.genre,
            playable: playable

        }

        return reTrack;


    },
    /** 
     * get full track object by id
     * @param {string} trackID - the track id 
     * @param {Object} user  - the user
     * @return {object}
     */
    getFullTrack: async function(trackId, user) {
        if (!checkMonooseObjectID([trackId])) return 0;
        const track = await this.getTrack(trackId, user);
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
     * @param {Array<string>} tracksIDs - the track ids
     * @param {Object} user - the user
     * @returns {Array<objects>}
     */
    getTracks: async function(trackIds, user) {
        if (!checkMonooseObjectID(trackIds)) return 0;
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
     * @param  {string}  trackID - the track id 
     * @returns {object} 
     * 
     */
    getAudioFeaturesTrack: async function(trackId) {
        if (!checkMonooseObjectID([trackId])) return 0;
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
     * @param {string}  trackIDs  - the track ids 
     * @returns {Array<Object>}
     */
    getAudioFeaturesTracks: async function(trackIds) {
        if (!checkMonooseObjectID(trackIds)) return 0;
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
     * @param {Object} user - the user 
     * @param {string} trackID - the track id 
     */
    checkIfUserLikeTrack: async function(user, trackId) {
        if (!user) return 0;
        if (!checkMonooseObjectID([trackId])) return 0;
        if (!user['likesTracksPlaylist']) return false;
        const playlist = await playlistDocument.findById(user['likesTracksPlaylist'], (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);
        if (!playlist.snapshot) return false;
        if (playlist.snapshot.length == 0) return false;
        if (playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length == 0) return false;
        ifFind = false;
        for (let i = 0; i < playlist.snapshot[playlist.snapshot.length - 1].hasTracks.length; i++)
            if (String(trackId) == String(playlist.snapshot[playlist.snapshot.length - 1].hasTracks[i])) {
                ifFind = true;
                break;
            }
        return ifFind;
    },
    /** 
     * user like track
     * @param  {Object} user  - the user
     * @param {string} trackID - the track id 
     * @returns {Number}
     */
    likeTrack: async function(trackId) {
        // if not found then add track.track_id to user likes and return the updated user
        // else return 0 as he already like the track
        if (!checkMonooseObjectID([trackId])) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0;
        if (!track.like) track.like = 0;
        track.like += 1;
        // save track
        await track.save().catch();
        return 1;
    },

    /** 
     * user unlike track
     * @param  {Object} user - the user 
     * @param {string} trackID - the track id 
     * @returns {Number}
     */
    unlikeTrack: async function(trackId) {
        // else return 0 as he didn't like the 
        if (!checkMonooseObjectID([trackId])) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0;
        if (!track.like) return 0;
        track.like -= 1;
        await track.save().catch();
        return 1;
    },
    /** 
     * user create track
     * @param {string}  url - the url of track
     * @param  {Number}  trackNumber - the number of track
     * @param {Array<string>}  availableMarkets - the markets
     * @param {String} artistID - the artist id
     * @param {String} albumID - the album id
     *  @param {String} key - track encryption key
     *  @param {String} keyId - track encryption key id
     *  @param {Array} genre - trck genres
     * @param {Number}  duration - the track duration
     * @returns {object}
     */
    createTrack: async function(url, Name, trackNumber, availableMarkets, artistId, albumId, duration, key, keyId, genre) {
        //if(typeof(url) != "string" || typeof(Name) != "string" || typeof(trackNumber) != "number" || typeof(duration) != "number") return 0;

        if (!checkMonooseObjectID([artistId, albumId])) return 0;
        if (!availableMarkets) availableMarkets = [];
        let track = new trackDocument({
            url: url,
            images: [],
            duration: duration,
            availableMarkets: availableMarkets,
            trackNumber: trackNumber,
            name: Name,
            artistId: artistId,
            albumId: albumId,
            discNumber: 1,
            explicit: false,
            type: "Track",
            acousticness: Math.floor(Math.random() * 100),
            danceability: Math.floor(Math.random() * 100),
            energy: Math.floor(Math.random() * 100),
            instrumentalness: Math.floor(Math.random() * 100),
            key: Math.floor(Math.random() * 100),
            liveness: Math.floor(Math.random() * 100),
            loudness: Math.floor(Math.random() * 100),
            mode: Math.floor(Math.random() * 100),
            speechiness: Math.floor(Math.random() * 100),
            tempo: Math.floor(Math.random() * 100),
            timeSignature: Date.now(),
            valence: Math.floor(Math.random() * 100),
            like: 0,
            key: key,
            keyId: keyId,
            genre: genre

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
    deleteTrack: async function(userId, trackId) {
        if (!checkMonooseObjectID([userId, trackId])) return 0;
        const user = await userDocument.findById(userId);
        if (!user) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0;
        // check if user is the artist that own the track
        const artist = await artistDocument.findOne({ userId: userId });
        if (!artist) return 0;
        // if artist dont own track then return 0
        if (String(artist._id) != String(track.artistId)) return 0;
        // delete track from artist,album,playlists,tracks,gridfs,track images
        // delete from artist

        if (!artist.addTracks) return 0;
        for (let i = 0; i < artist.addTracks.length; i++) {
            if (String(artist.addTracks[i].trackId) == trackId) {
                artist.addTracks.splice(i, 1);
                break;
            }
        }
        await artist.save();
        // delete from album
        const album = await albumDocument.findById(track.albumId);

        if (!album) return 0;
        if (!album.hasTracks) return 0;
        for (let i = 0; i < album.hasTracks.length; i++) {
            if (String(album.hasTracks[i].trackId) == trackId) {
                album.hasTracks.splice(i, 1);
                break;
            }
        }
        await album.save();
        // delete from all playlist in the database
        await playlistDocument.find({}, async(err, files) => {
            if (err) return 0;
            for (let playlist of files) {
                if (!playlist.snapshot) continue;

                for (let i = 0; i < playlist.snapshot.length; i++) {
                    if (!playlist.snapshot[i].hasTracks) continue;
                    for (let j = 0; j < playlist.snapshot[i].hasTracks.length; j++) {
                        if (String(playlist.snapshot[i].hasTracks[j]) == trackId) {
                            playlist.snapshot[i].hasTracks.splice(j, 1);
                            break;
                        }
                    }
                }
                await playlist.save();
            }
        });
        await userDocument.find({}, async(err, files) => {
            if (err) return 0;
            for (let user1 of files) {
                if (user1.recentlySearch) {
                    for (let i = 0; i < user1.recentlySearch.length; i++)
                        if (String(user1.recentlySearch[i].id) == String(trackId) && user1.recentlySearch[i].objectType == 'track')
                            user1.recentlySearch.splice(i, 1)
                }
                if (user1.playHistory) {
                    for (let i = 0; i < user1.playHistory.length; i++)
                        if (String(user1.playHistory[i].trackId) == String(trackId))
                            user1.playHistory.splice(i, 1)
                }
                await user1.save();
            }
        });
        // delete track images
        if (!track.images) track.images = [];
        // delete image from gridfs
        await Image.deleteImages(userId, trackId, 'track');
        // delete from tracks
        await trackDocument.findByIdAndDelete(trackId);
        // delete from gridfs
        // await gfsTracks.files.re44({"metadata.trackId":mongoose.Types.ObjectId(trackId)},(err,files)=>{
        //     console.log(files);
        // })
        // await gfsTracks.files.find({ "metadata.trackId": mongoose.Types.ObjectId(trackId) }).toArray(async function(err, files) {
        //         if (files) {
        //             //console.log(files);
        //             for (let file of files) {
        //                 // console.log(file,file._id)
        //                 //await gfsTracks.chunks.deleteMany({files_id:mongoose.Types.ObjectId(file._id)})
        //                 await gfsTracks.db.collection('tracks.chunks').remove({ files_id: mongoose.Types.ObjectId(file._id) });
        //                 await gfsTracks.files.deleteMany({ "metadata.trackId": mongoose.Types.ObjectId(trackId) })
        //             }
        //         }
        //     })
        // await gfsTracks.chunks.deleteMany({"files_id":mongoose.Types.ObjectId(trackId)})
        drive.files.list({
            corpora: 'user',
            pageSize: 10,
            fields: 'files(*)',
            q: `appProperties  has {   key='trackId' and value='${trackId}' } `

        }, async(err, data) => {
            if (err) { res.status(404).send('no data'); return; }
            if (data.data.files.length == 0) { res.status(404).send('nno data'); return; }
            for (let file of data.data.files) {
                await drive.files.delete({
                    'fileId': file.id
                });
            };
        });

        return 1;

    },
    // get related tracks to specific track
    /**
     * 
     * get related tracks to a track
     * @param {String} trackId 
     * @returns {Object}
     */
    getRelatedTrack: async function(trackId) {
        if (!checkMonooseObjectID([trackId])) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0;
        if (!track.genre) return 0;
        let tracksRelated = [];
        await trackDocument.find({}, (err, tracks) => {
            if (err) throw err;
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
        });
        if (tracksRelated.length == 0) return 0;
        return tracksRelated;
    },
    /**
     * get related full tracks to certain user
     * @param {String} userId 
     * @param {String} trackId 
     * @returns {Object}
     */
    getFullRelatedTracks: async function(userId, trackId) {
        if (!checkMonooseObjectID([userId, trackId])) return 0;

        const user = await userDocument.findById(userId);

        if (!user) return 0;
        const fullTrack = await this.getFullTrack(trackId, user);
        if (!fullTrack) return 0;

        let tracksRelated = [fullTrack];
        const track = fullTrack.track;

        if (!track.genre) return tracksRelated;

        const tracks = await trackDocument.find({});
        if (!tracks) return tracksRelated;
        for (let trackFile of tracks) {
            if (tracksRelated.length > 10) return;
            if (!trackFile.genre) continue;
            if (String(trackFile._id) == trackId) continue;
            for (let i = 0; i < trackFile.genre.length; i++) {
                if (track.genre.includes(trackFile.genre[i])) {
                    // get full track
                    const fullTrackFile = await this.getFullTrack(String(trackFile._id), user);

                    if (!fullTrackFile) continue;

                    tracksRelated.push(fullTrackFile);

                    break;
                }
            }
        }


        if (tracksRelated.length == 0) return 0;
        return tracksRelated;
    },
    /**
     * check if track is playable to certain user
     * @param {String} user 
     * @param {String} trackId 
     * @returns {Boolean}
     */
    checkPlayable: async function(user, trackId) {
        if (!user) return 0;
        if (!checkMonooseObjectID([trackId])) return 0;
        if (user.product == "premium") return true;
        let track = await trackDocument.findById(trackId);
        if (!track) return 0;
        if (!track.availableMarkets) return 0;
        if (track.availableMarkets.includes(user.country)) {
            return true;
        }
        return false;

    },
    /**
     * edit track info
     * @param {String} userId 
     * @param {String} trackId 
     * @param {Object} body 
     */
    updateTrack: async function(userId, trackId, body) {
        if (!checkMonooseObjectID([userId, trackId])) return 0;
        if (!body) return 0;
        const user = await userDocument.findById(userId);
        if (!user) return 0;
        const track = await this.getTrack(trackId);
        if (!track) return 0;
        // check if user is the artist that own the track
        const artist = await artistDocument.findOne({ userId: userId });
        if (!artist) return 0;
        // if artist dont own track then return 0
        if (String(artist._id) != String(track.artistId)) return 0;
        // if artist own the track then update the track and save it
        for (let key in body) {
            if (key == "name" || key == "availableMarkets" || key == "duration" || key == "genre")
                track[key] = body[key];
        }
        await track.save();
        return track;
    }

}

module.exports = Track;