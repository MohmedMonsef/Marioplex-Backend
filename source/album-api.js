const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');


// initialize db 
const Track = require('./track-api');
const Artist = require('./artist-api');
const CheckMonooseObjectId = require('../validation/mongoose-objectid')
    /** @namespace */
const Album = {
    
    /**
     * get number of likes for an album per month
     * @param {String} albumId
     * @returns {Number} 
     */
    getAlbumNumberOfLikesInMonth: async function(albumId) {
        let album = await this.getAlbumById(albumId);
        if (!album) return -1;
        if (!album.followed) { album.followed = []; return 0; }
        var numberOfLikes = 0;
        var today = new Date();
        for (let i = 0; i < album.followed.length; i++) {
            let date = album.followed[i].date;
            if (date.getMonth() == today.getMonth() &&
                date.getFullYear() == today.getFullYear())
                numberOfLikes += 1;
        }
        return numberOfLikes;

    },
    /**
     * get number of likes for an album per day
     * @param {String} albumId
     * @returns {Number} 
     */
    getAlbumNumberOfLikesInDay: async function(albumId) {
        let album = await this.getAlbumById(albumId);
        if (!album) return -1;
        if (!album.followed) { album.followed = []; return 0; }
        var numberOfLikes = 0;
        var today = new Date();
        for (let i = 0; i < album.followed.length; i++) {
            let date = album.followed[i].date;
            if (date.getMonth() == today.getMonth() &&
                date.getFullYear() == today.getFullYear() &&
                date.getDay() == today.getDay())
                numberOfLikes += 1;
        }
        return numberOfLikes;
    },
    /**
     * get number of likes for an album per year
     * @param {String} artistId
     * @returns {Number} 
     */
    getAlbumNumberOfLikesInYear: async function(albumId) {
        let album = await this.getAlbumById(albumId);
        if (!album) return -1;
        if (!album.followed) { album.followed = []; return 0; }
        var today = new Date();
        var numberOfLikes = 0;
        if (!album.followed) album.followed = [];
        for (let i = 0; i < album.followed.length; i++) {
            let date = album.followed[i].date;
            if (date.getFullYear() == today.getFullYear())
                numberOfLikes += 1;
        }
        return numberOfLikes;

    },
    /**
     * add track to album
     * @param {string} albumId - album id
     * @param {object} track
     *   
     */
    addTrack: async function(albumId, track) {
        if (!CheckMonooseObjectId([albumId])) return 0;
        const album = await albumDocument.findById(albumId);
        if (album) {
            if (!album.hasTracks) album.hasTracks = [];
            album.hasTracks.push({
                trackId: track._id
            });
            await album.save();
            return 1;
        }
        return 0;
    },
    /**
     * get album by id
     * @param {string} albumId  -the id of album
     * @returns {object} -album object  
     */
    getAlbumById: async function(albumId) {

        // connect to db and find album with the same id then return it as json file
        // if found return album else return 0
        if (!CheckMonooseObjectId([albumId])) return 0;
        let album = await albumDocument.findById(albumId, (err, album) => {
            if (err) return 0;
            return album;
        });
        return album;


    },
    /**
     * Delete album feom all database 
     * @param {String} userId - user id of the artist upload this track
     * @param {String} albumId - the id of album want to delete
     * @returns {Boolean}
     */
    deleteAlbum: async function(userId, albumId) {
        if (!CheckMonooseObjectId([albumId])) return 0;
        const artistD = await Artist.findMeAsArtist(userId);
        if (!artistD) return 0;
        if (!Artist.checkArtisthasAlbum(artistD._id, albumId)) return 0;
        const album = await this.getAlbumById(albumId);
        if (!album) return 0;
        if (album.hasTracks) {
            for (let i = 0; i < album.hasTracks.length; i++) {
                await Track.deleteTrack(userId, album.hasTracks[i].trackId);
            }
        }
        await artistDocument.update({ '_id': artistD._id }, { $pull: { 'addAlbums': { albumId } } });


        if (!await albumDocument.findByIdAndDelete(albumId)) return 0;
        await userDocument.find({}, async(err, files) => {
            if (err) return 0;
            for (let user of files) {
                if (user.saveAlbum) {
                    await userDocument.update({ '_id': userId }, { $pull: { 'saveAlbum': { albumId } } });
                }
                if (user.recentlySearch) {
                    for (let i = 0; i < user.recentlySearch.length; i++)
                        if (String(user.recentlySearch[i].id) == String(albumId) && user.recentlySearch[i].objectType == 'album')
                            user1.recentlySearch.splice(i, 1)
                }
                if (user.playHistory) {
                    // not very important becouse track will remove it
                    for (let i = 0; i < user.playHistory.length; i++)
                        if (String(user.playHistory[i].sourceId) == String(albumId) && user.playHistory[i].sourceType == 'album')
                            user1.playHistory.splice(i, 1)
                }
                await user.save();
            }
        });

        return 1;
    },
    /**
     * get new releases
     * @returns {JSON} -contain array of albums object
     */
    getNewReleases: async function() {
        // with - is from big to small and without is from small to big
        var reAlbums = []
        const albums = await albumDocument.find({}).sort('-releaseDate').limit(Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20);
        if (albums) {
            var limit; // to limit the num of albums by frist 10 only but should check if num of albums less than 10  
            if (albums.length < Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20) limit = albums.length;
            else limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;

            for (let i = 0; i < limit; i++) {
                const artist1 = await Artist.getArtist(albums[i].artistId);
                reAlbums.push({ album_type: albums[i].albumType, artist: { type: 'artist', id: albums[i].artistId, name: artist1.Name }, available_markets: albums[i].availableMarkets, images: albums[i].images, id: albums[i]._id, name: albums[i].name, type: 'album' });
            }
        }
        const reAlbumsJson = { albums: reAlbums };
        return reAlbumsJson;
    },
    /**
     * get popular albums
     * @returns {JSON} -contain array of albums object
     */
    getPopularAlbums: async function() {
        // with - is from big to small and without is from small to big
        var reAlbums = []
        const albums = await albumDocument.find({}).sort('-popularity').limit(Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20);
        if (albums) {
            var limit; // to limit the num of albums by frist 20 only but should check if num of albums less than 10  
            if (albums.length < Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20) limit = albums.length;
            else limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            for (let i = 0; i < limit; i++) {
                if (albums[i].artistId) {
                    const artist1 = await Artist.getArtist(albums[i].artistId);
                    reAlbums.push({ album_type: albums[i].albumType, artist: { type: 'artist', id: albums[i].artistId, name: artist1.Name }, available_markets: albums[i].availableMarkets, images: albums[i].images, id: albums[i]._id, name: albums[i].name, type: 'album' });
                }
            }
        }
        const reAlbumsJson = { albums: reAlbums };
        return reAlbumsJson;
    },
    /**
     * get album with artist info &if user saved this album or not 
     * @param {string} albumId - the id of album
     * @param {string} userId  -the id of user
     * @returns {object} -album object contain its artist info 
     */
    getAlbumArtist: async function(albumId, userId, isAuth) {

        // connect to db and find album with the same id then return it as json file
        // if found return album else return 0
        if (!CheckMonooseObjectId([albumId, userId])) return 0;
        let album = await this.getAlbumById(albumId);
        let albumInfo = {}
        let user = await userDocument.findById(userId);
        if (isAuth) {
            if (user) {
                let isSaved = await this.checkIfUserSaveAlbum(user, albumId);
                if (isSaved) {
                    albumInfo['isSaved'] = true;
                } else {
                    albumInfo['isSaved'] = false;
                }

            }
        }

        if (album) {
            let artistInfo = await Artist.getArtist(album.artistId);
            let track = await this.getTracksAlbum(albumId, user, isAuth);
            albumInfo['_id'] = album._id;
            albumInfo['name'] = album.name;
            albumInfo['images'] = album.images;
            if (artistInfo) {
                albumInfo['artistId'] = artistInfo._id;
                albumInfo['artistName'] = artistInfo.Name;
            }
            if (track) {
                albumInfo['track'] = track;
            } else {
                albumInfo['track'] = []
            }
            return albumInfo;
        } else {
            return 0;
        }



    },
    /**
     * find the order of track in album
     * @param {string} trackId -the id of track
     * @param {object} album -album object
     * @returns {Number} -the index of track in album
     *  
     */
    // the order of track in album 's tracks
    findIndexOfTrackInAlbum: async function(trackId, album) {
        if (!CheckMonooseObjectId([trackId])) return -1;
        if (!album.hasTracks) album.hasTracks = [];
        for (let i = 0; i < album.hasTracks.length; i++) {
            if (String(album.hasTracks[i].trackId) == String(trackId)) return i;
        }
        return -1
    },
    /**
     * get several albums
     * @param {Array<string>} albumIds -array of albums ids 
     * @returns {Array} -contain set has albums object 
     */
    // get several albums by ids
    getAlbums: async function(albumIds) {

        // connect to db and find album with the same id then return it as json file
        // if found return album else return 0

        var albums = []
        if (albumIds == undefined) return 0;
        if (!CheckMonooseObjectId(albumIds)) return 0;
        for (var i = 0; i < albumIds.length; i++) {
            var album = await this.getAlbumById(albumIds[i]);
            if (album) {
                albums.push(album)
            }
        }
        if (albums.length > 0) {
            albumWithArtist = []
            for (let i = 0; i < albums.length; i++) {
                let artistData = await Artist.getArtist(albums[i].artistId);
                if (artistData) {
                    albumWithArtist.push({ Album: albums[i], Artist: artistData });
                }
            }
            return albumWithArtist;

        } else return 0;
    },
    /**
     * get album's tracks 
     * @param {string} albumId  - the id of album
     * @param {object} user -user object 
     * @returns {Array} -contain set has tracks
     */
    //  get tracks of an album
    getTracksAlbum: async function(albumId, user, isAuth) {

        // connect to db and find album with the same id then return it as json file
        // if found return album else return 0
        if (!CheckMonooseObjectId([albumId])) return 0;
        const tracksInfo = [];
        const album = await this.getAlbumById(albumId);
        if (!album) {
            return 0;
        } else {
            if (!album.hasTracks) album.hasTracks = [];
            for (i = 0; i < album.hasTracks.length; i++) {
                if (!album.hasTracks[i].trackId) continue;
                var trackInfo = await Track.getTrack(album.hasTracks[i].trackId, user);
                if (trackInfo) {
                    let tracks = {}
                    tracks['_id'] = trackInfo._id;
                    tracks['name'] = trackInfo.name;
                    tracks['images'] = trackInfo.images;
                    if (isAuth) {
                        tracks['isLiked'] = await Track.checkIfUserLikeTrack(user, trackInfo._id);
                    }
                    tracks['playable'] = trackInfo.playable;
                    tracks['duration'] = trackInfo.duration;
                    tracksInfo.push(tracks);
                }
            }
        }
        if (tracksInfo.length == 0) {
            return 0;
        }
        return tracksInfo;
    },
    /**
     * check if user followed this album 
     * @param {object} user 
     * @param {string} albumId 
     * @returns {object}
     */
    //user like album by track-id
    //params : user , track-id
    checkIfUserSaveAlbum: function(user, albumId) {
        if (!CheckMonooseObjectId([albumId])) return 0;
        const albumsUserSaved = user.saveAlbum;
        // if user.like.contains({track_id:track.track_id})
        if (albumsUserSaved) {
            return albumsUserSaved.find(album => String(album.albumId) == String(albumId));
        }
        return 0;
    },
    /**
     * save album (make user follow an album)
     * @param {object} user 
     * @param {string} albumId
     */
    //user save track by album-id
    //params : user , album-id
    saveAlbum: async function(user, albumId) {
        // check if user already saved the album
        // if not found then add album.album_id to user likes and return the updated user
        // else return 0 as he already saved the album
        if (albumId == undefined) return 2;
        if (!CheckMonooseObjectId(albumId)) return 0;
        let count=0;
        for (let j = 0; j < albumId.length; j++) {
            let album = await this.getAlbumById(albumId[j]);
            if (album) {
                if (this.checkIfUserSaveAlbum(user, album._id) == undefined) {
                if (!user.saveAlbum) {
                    user.saveAlbum = [];
                }
                user.saveAlbum.push({
                    albumId: album._id,
                    savedAt: Date.now()
                });
                await user.save();
                if(!album.followed){
                    album.followed = [];
                }
                album.followed.push({ 'id': user._id, 'date': new Date() });
                await album.save();
                } 
                else { count++; }
            }
            else { count++; }
                 
        }
        if(count == albumId.length){
            return 0;
        }
        return 1;
        
    },
    /**
     * unsave album (make user unfollow an album)
     * @param {object} user 
     * @param {string} albumId 
     */
    unsaveAlbum: async function(user, albumId) {
        // check if user already saved the album
        // if not found then add album.album_id to user likes and return the updated user
        // else return 0 as he already saved the album
        let found = false;
        if (albumId == undefined) return 0;
        if (!CheckMonooseObjectId(albumId)) return 0;
        for (let j = 0; j < albumId.length; j++) {
            if (this.checkIfUserSaveAlbum(user, albumId[j])) {
                found = true;
                await albumDocument.update({ '_id': albumId[j] }, { $pull: { 'followed': { 'id': user._id } } });
                await userDocument.update({ '_id': user._id }, { $pull: { 'saveAlbum': { 'albumId': albumId[j] } } });
            } 
            else {
                if ((!found && (j == (albumId.length - 1))) || (albumId.length == 1)) {
                    return 0;
                }
            }
        }
        return 1;
    },
    /**
     *  get number of listeners  of album per day
     * @param {String} albumId -the id of album 
     * @param {Number} year 
     * @param {Number} month 
     * @param {Number} day 
     * @returns {Number}
     */
    getAlbumListenersPerDay: async function(albumId, year, month, day) {
        try {
            const album = await albumDocument.findById(albumId);
            if (!album || !album.liseteners || album.liseteners.length == 0) return 0;
            for (let i = 0; i < album.liseteners.length; i++)
                if (album.liseteners[i].dateForThis == Number(year) * 10000 + Number(day) + Number(month) * 100)
                    return album.liseteners[i].numberOfLiseteners;
            return 0;
        } catch (ex) {
            return 0;
        }
    },
    /**
     *  get number of listeners  of album per month
     * @param {String} albumId -the id of album 
     * @param {Number} year 
     * @param {Number} month 
     * @returns {Number}
     */
    getAlbumListenersPerMonth: async function(albumId, year, month) {
        try {
            const album = await albumDocument.findById(albumId);
            let noOfLisners = 0;
            if (!album || !album.liseteners || album.liseteners.length == 0) return 0;
            for (let i = 0; i < album.liseteners.length; i++)
                if (album.liseteners[i].dateForThis >= Number(year) * 10000 + Number(month) * 100 && album.liseteners[i].dateForThis < Number(year) * 10000 + (Number(month) + 1) * 100)
                    noOfLisners += album.liseteners[i].numberOfLiseteners;

            return noOfLisners;
        } catch (ex) {
            return 0;
        }
    },
    /**
     *  get number of listeners p of album per year
     * @param {String} albumId -the id of album 
     * @param {Number} year  
     * @returns {Number}
     */
    getAlbumListenersPerYear: async function(albumId, year) {
        try {
            const album = await albumDocument.findById(albumId);
            let noOfLisners = 0;
            if (!album || !album.liseteners || album.liseteners.length == 0) return 0;
            for (let i = 0; i < album.liseteners.length; i++)
                if (album.liseteners[i].dateForThis >= Number(year) * 10000 && album.liseteners[i].dateForThis < (Number(year) + 1) * 10000)
                    noOfLisners += album.liseteners[i].numberOfLiseteners;

            return noOfLisners;
        } catch (ex) {
            return 0;
        }
    },
}
module.exports = Album;