const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');

const Album = require('./album-api');
const ArtistApi = require('./artist-api');
const Playlist = require('../source/playlist-api');
const CheckMonooseObjectId = require('../validation/mongoose-objectid')
const Library = {
    /**
     * check if user saves albums
     * @param {Array<string>} albumsIds - array of albums' id
     * @param {string} userId - user id
     * @returns {Array<boolean>} 
     */
    checkSavedAlbums: async function(albumsIds, userId) {
        //  console.log(albumsIds)
        if (!CheckMonooseObjectId(albumsIds)) return 0;
        if (!CheckMonooseObjectId([userId])) return 0;
        let checks = [];
        let found = false;
        const user = await userDocument.findById(userId, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);
        if (!user) return 0;
        //  console.log(user);
        if (!user.saveAlbum) user.saveAlbum = [];
        for (var i = 0; i < albumsIds.length; i++) {
            found = false;

            for (let album in user.saveAlbum) {
                //console.log(albumsIds[i]);
                //console.log(user.saveAlbum[album].albumId);
                if (String(user.saveAlbum[album].albumId) == String(albumsIds[i])) {
                    // console.log('i am in here : ');
                    checks.push(true);
                    found = true;
                    //  console.log(checks);
                }
            }
            if (!found) {
                checks.push(false);
            }
        }
        //console.log(checks);
        return checks;
    },
    /**
     * check if user saves tracks
     * @param {Array<string>} tracksIds - array of tracks' id
     * @param {string} userId - user id
     * @returns {Array<boolean>} 
     */
    checkSavedTracks: async function(tracksIds, userId) {
        if (!CheckMonooseObjectId([userId])) return 0;
        if (!CheckMonooseObjectId(tracksIds)) return 0;
        const user = await userDocument.findById(userId, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);
        if (!user) return 0;
        let checks = [];
        for (let i = 0; i < tracksIds.length; i++)
            checks.push(false);
        //console.log(user);
        // console.log(user['likesTracksPlaylist']);
        if (!user['likesTracksPlaylist']) return checks;
        //console.log('this is me :')
        return await Playlist.checkPlaylistHasTracks(user['likesTracksPlaylist'], tracksIds);
    },
    /**
     * get  saved albums for a specific user
     * @param {string} userId - user id
     * @param {number} [limit] - the maximum number of objects to return
     * @param {number} [offset] - the index of the first object to return
     * @returns {Array<object>} - array of albums' object
     */
    //get  saved albums for a user
    //params: userId, limit, offset
    getSavedAlbums: async function(userId, limit, offset) {
        if (!CheckMonooseObjectId([userId])) return 0;
        let albumsArray = [];
        let user = await userDocument.findById(userId);
        if (!user) return 0;
        if (!user.saveAlbum) user.saveAlbum = [];
        if (user.saveAlbum.length == 0) return 0;
        for (let i = 0; i < user.saveAlbum.length; i++) {
            let album = await Album.getAlbumById(user.saveAlbum[i].albumId);
            if (album) albumsArray.push(album);
        }

        let start = 0;
        let end = (albumsArray.length > 20) ? 20 : albumsArray.length;
        if (offset != undefined) {
            if (offset >= 0 && offset <= albumsArray.length) {
                start = offset;
            }
        }
        if (limit != undefined) {
            if ((start + limit) > 0 && (start + limit) <= albumsArray.length) {
                end = start + limit;
            }
        } else {
            limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            if ((start + limit) > 0 && (start + limit) <= albumsArray.length) {
                end = start + limit;
            }
        }
        let albumSlice = albumsArray.slice(start, end);
        albumInfo = []
        for (let i = 0; i < albumSlice.length; i++) {
            let albums = await Album.getAlbumArtist(albumSlice[i]._id, userId);
            if (albums) {
                albumInfo.push(albums);
            }

        }
        return albumInfo;

    },

    /**
     * get saved tracks for certain user
     * @param {string} userId  - user id 
     * @param {Numbrt} limit  
     * @param {Number} offset 
     * @returns{object} - contain users saved tracks
     */
    getSavedTracks: async function(userId, limit, offset) {
        if (!CheckMonooseObjectId([userId])) return 0;
        let user = await userDocument.findById(userId);
        if (!user) return 0;
        if (!user['likesTracksPlaylist']) return 0;
        let tracksPlaylist = await Playlist.getPlaylistTracks(user['likesTracksPlaylist'], true);
        //console.log(tracksPlaylist);
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
            let artist = await ArtistApi.getArtist(trackSlice[i].artistId)
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
        return { "tracks": trackInfo, "ownerName": user.displayName, playlistId: user['likestracksPlaylist'] };

    }
}

module.exports = Library;