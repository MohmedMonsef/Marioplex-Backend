const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const spotify = require('../models/db');
const Album = require('./album-api');
const Track = require('./track-api');
const artist_api = require('./artist-api');
const Playlist = require('../source/playlist-api');
const checkMonooseObjectID = require('../validation/mongoose-objectid')
const Library = {
    /**
     * check if user saves albums
     * @param {Array<string>} albumsIds - array of albums' id
     * @param {string} userId - user id
     * @returns {Array<boolean>} 
     */
    //check if user saves albums
    //params: array of AlbumsIDs, UserID
    checkSavedAlbums: async function(albumsIds, userId) {
        if (!checkMonooseObjectID(albumsIds)) return 0;
        if (!checkMonooseObjectID([userId])) return 0;
        let checks = [];
        let found = false;
        const user = await userDocument.findById(userId, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);
        if (!user.saveAlbum) user.saveAlbum = [];
        for (var i = 0; i < albumsIds.length; i++) {
            found = false;

            for (let Album in user.saveAlbum) {
                if (user.saveAlbum[Album].albumId == albumsIds[i]) {
                    checks.push(true);
                    found = true;
                }
            }
            if (!found) {
                checks.push(false);
            }
        }
        return checks;

    },
    /**
     * check if user saves tracks
     * @param {Array<string>} tracksIds - array of tracks' id
     * @param {string} userId - user id
     * @returns {Array<boolean>} 
     */
    //check if user saves tracks
    //params: array of TracksIDs, UserID
    checkSavedTracks: async function(TracksIDs, UserID) {
        if (!checkMonooseObjectID([UserID])) return 0;
        if (!checkMonooseObjectID(TracksIDs)) return 0;
        const user = await userDocument.findById(UserID, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);
        if (!user['likesTracksPlaylist']) return 0;
        return await Playlist.checkPlaylistHasTracks(user['likesTracksPlaylist'], TracksIDs);
    },
    /**
     * get  saved albums for a specific user
     * @param {number} [limit] - the maximum number of objects to return
     * @param {number} [offset] - the index of the first object to return
     * @param {string} userId - user id
     * @returns {Array<object>} - array of albums' object
     */
    //get  saved albums for a user
    //params: UserID, limit, offset
    getSavedAlbums: async function(UserID, limit, offset) {
        if (!checkMonooseObjectID([UserID])) return 0;
        let Albums = [];
        let user = await userDocument.findById(UserID);
        if (!user) return 0;
        if (!user.saveAlbum) user.saveAlbum = [];
        if (user.saveAlbum.length == 0) return 0;
        for (let i = 0; i < user.saveAlbum.length; i++) {
            let album = await Album.getAlbumById(user.saveAlbum[i].albumId);
            if (album) Albums.push(album);
        }

        let start = 0;
        let end = (Albums.length > 20) ? 20 : Albums.length;
        if (offset != undefined) {
            if (offset >= 0 && offset <= Albums.length) {
                start = offset;
            }
        }
        if (limit != undefined) {
            if ((start + limit) > 0 && (start + limit) <= Albums.length) {
                end = start + limit;
            }
        } else {
            limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            if ((start + limit) > 0 && (start + limit) <= Albums.length) {
                end = start + limit;
            }
        }
        let albumSlice = Albums.slice(start, end);
        albumInfo = []
        for (let i = 0; i < albumSlice.length; i++) {
            let albums = await Album.getAlbumArtist(albumSlice[i]._id, UserID);
            if (albums) {
                albumInfo.push(albums);
            }

        }
        return albumInfo;

    },

    /**
     * get saved tracks for certain user
     * @param {string} UserID  - user id 
     * @param {Numbrt} limit  
     * @param {Number} offset 
     * @returns{object} - contain users saved tracks
     */
    //get  saved traks for a user
    //params: UserID, limit, offset
    getSavedTracks: async function(UserID, limit, offset) {
        if (!checkMonooseObjectID([UserID])) return 0;
        let user = await userDocument.findById(UserID);
        if (!user) return 0;
        if (!user['likesTracksPlaylist']) return 0;
        let tracksPlaylist = await Playlist.getPlaylistTracks(user['likesTracksPlaylist'], true);
        console.log(tracksPlaylist)
        if (tracksPlaylist[0].tracks.length == 0 || !tracksPlaylist) return 0;
        tracksPlaylist = tracksPlaylist[0].tracks;

        let start = 0;
        let end = (tracksPlaylist.length > 20) ? 20 : tracksPlaylist.length;
        if (offset != undefined) {
            if (offset >= 0 && offset <= tracksPlaylist.length) {
                start = offset;
            }
        }
        if (limit != undefined) {
            if ((start + limit) > 0 && (start + limit) <= tracksPlaylist.length) {
                end = start + limit;
            }
        } else {
            limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            if ((start + limit) > 0 && (start + limit) <= tracksPlaylist.length) {
                end = start + limit;
            }
        }
        let trackSlice = tracksPlaylist.slice(start, end);
        trackInfo = []
        for (let i = 0; i < trackSlice.length; i++) {
            let artist = await artist_api.getArtist(trackSlice[i].artistId)
            tracks = {}
            if (artist) {
                tracks["artistId"] = artist._id
                tracks["artistName"] = artist.Name
                tracks["artistimages"] = artist.images
                tracks["artistType"] = artist.type
            }
            let album = await Album.getAlbumById(trackSlice[i].albumId)
            if (album) {
                tracks["albumId"] = album._id
                tracks["albumName"] = album.name
                tracks["albumImages"] = album.images
                tracks["albumType"] = album.type
            }
            tracks["_id"] = trackSlice[i]._id
            tracks["name"] = trackSlice[i].name
            tracks["type"] = trackSlice[i].type
            tracks["images"] = trackSlice[i].images
            trackInfo.push(tracks);
        }
        return { "tracks": trackInfo, "ownerName": user.displayName, playlistId: user['likesTracksPlaylist'] };

    }



}

module.exports = Library;