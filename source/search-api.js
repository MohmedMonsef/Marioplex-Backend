const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
var FuzzySearch = require('fuzzy-search');


// initialize db 
const checkMonooseObjectID = require('../validation/mongoose-objectid')
const artistApi = require('./artist-api');
const user_api = require('./user-api');
const Track = require('./track-api');
const artist_api = require('./artist-api');
const album_api = require('./album-api');
const Playlist = require('./playlist-api');
const Search = {
    /** 
     * add tosearch history
     * @param {object}  userId - user id
     * @param  {String} id - the id of object
     * @param {String} objectType - type of this id is album , track , playlist , artist or user
     * @returns {Boolean}
     */
    addToRecentlySearch: async function(userId, id, objectType) {
        if (!checkMonooseObjectID([id, userId])) return 0;
        user = await userDocument.findById(userId);
        if (!user) return 0;
        //return user;
        let object;

        if (objectType == 'artist')
            object = await artistDocument.findById(id);
        else if (objectType == 'user')
            object = await userDocument.findById(id);
        else if (objectType == 'playlist')
            object = await playlistDocument.findById(id);
        else if (objectType == 'album')
            object = await albumDocument.findById(id);
        else if (objectType == 'track')
            object = await trackDocument.findById(id);
        else return 0;
        if (!object) return 0;
        if (!user.recentlySearch) user.recentlySearch = [];
        await this.removeRecently(userId, objectType, id)
        if (user.recentlySearch.length == 50) await user.recentlySearch.splice(0, 1);
        user.recentlySearch.push({ id: id, objectType: objectType });
        await user.save();

        return 1;
    },
    /** 
     * remove from search history
     * @param {object}  userId - user id
     * @param  {String} id - the id of object
     * @param {String} type - type of this id is album , track , playlist , artist or user
     * @returns {Boolean}
     */
    removeRecently: async function(userId, type, id) {
        if (!checkMonooseObjectID([id, userId])) return 0;
        user = await userDocument.findById(userId);
        if (!user) return 0;
        if (!user.recentlySearch || user.recentlySearch.length == 0) return 0;
        for (let i = 0; i < user.recentlySearch.length; i++) {
            if (String(user.recentlySearch[i].id) == String(id) && user.recentlySearch[i].objectType == type) {
                user.recentlySearch.splice(i, 1);
                await user.save();
                return 1;
            }
        }
        return 0;
    },
    /**
     * get recently search for user
     * @param {String} userId - user id
     * @returns {object}
     */
    getRecentlySearch: async function(userId) {
        if (!checkMonooseObjectID([userId])) return 0;
        user = await userDocument.findById(userId);
        if (!user) return 0;
        // console.log(user.recentlySearch)
        if (!user.recentlySearch || user.recentlySearch.length == 0) user.recentlySearch = [];
        let artists = [];
        let tracks = [];
        let playlists = [];
        let albums = [];
        let users = [];
        for (let i = 0; i < user.recentlySearch.length; i++) {
            if (user.recentlySearch[i].objectType == 'artist') {
                const artist = await artistApi.getArtist(user.recentlySearch[i].id);
                if (artist)
                    artists.push({
                        genre: artist.genre,
                        type: 'artist',
                        name: artist.Name,
                        images: artist.images,
                        id: artist._id,
                        info: artist.info,
                        popularity: artist['popularity'],
                        isFollow: await user_api.CheckIfUserFollowArtist(userId, user.recentlySearch[i].id)
                    });
            } else if (user.recentlySearch[i].objectType == 'playlist') {
                const playlist = await Playlist.getPlaylist(user.recentlySearch[i].id);
                if (playlist)
                    if (playlist.isPublic || String(Playlist.ownerId) == String(userId)) {
                        const user1 = await userDocument.findById(playlist.ownerId);
                        playlists.push({
                            owner: {
                                id: playlist.ownerId,
                                type: 'user',
                                name: user1.displayName
                            },
                            collaborative: playlist.collaborative,
                            type: 'playlist',
                            name: playlist.name,
                            images: playlist.images,
                            id: playlist._id,
                            Description: playlist.Description,
                            isPublic: playlist.isPublic,
                            popularity: playlist['popularity'],
                            isFollow: await Playlist.checkFollowPlaylistByUser(user)
                        });
                    }


            } else if (user.recentlySearch[i].objectType == 'album') {
                const album = await album_api.getAlbumById(user.recentlySearch[i].id);
                if (album) {
                    const artist1 = await artist_api.getArtist(album.artistId);
                    albums.push({
                        album_type: album.albumType,
                        artist: { type: 'artist', id: album.artistId, name: artist1.Name },
                        available_markets: album.availableMarkets,
                        images: album.images,
                        id: album._id,
                        name: album.name,
                        type: 'album',
                        isFollow: await album_api.checkIfUserSaveAlbum(user, album._id) ? true : false
                    });

                }
            } else if (user.recentlySearch[i].objectType == 'user') {
                const user2 = await user_api.getUserById(user.recentlySearch[i].id)
                if (user2)
                    users.push({ name: user2.displayName, id: user2._id, type: 'user', images: user2.images, country: user2.country, email: user2.email });
            } else if (user.recentlySearch[i].objectType == 'track') {
                const track = await Track.getFullTrack(user.recentlySearch[i].id, user);
                if (track)
                    tracks.push(track);
            }
        }
        return { 'playlists': playlists, 'tracks': tracks, 'albums': albums, 'users': users, 'artists': artists };
    },
    //get all users
    getUsers: async function() {

        let user = await userDocument.find({}, (err, user) => {
            if (err) return 0;
            return user;
        }).catch((err) => 0);
        return user;

    },
    getArtists: async function() {

        let artist = await artistDocument.find({}, (err, artist) => {
            if (err) return 0;
            return artist;
        }).catch((err) => 0);
        return artist;

    },

    //get all albums
    getAlbums: async function() {
        let album = await albumDocument.find({}, (err, album) => {
            if (err) return 0;
            return album;
        }).catch((err) => 0);
        return album;

    },

    //get user by name
    //params: name
    getUserByname: async function(name) {

        const user = await this.getUsers();
        if (user.length == 0) return 0;
        return Fuzzysearch(name, 'displayName', user);

    },
    getArtistByname: async function(name) {

        const artist = await this.getArtists();
        if (artist.length == 0) return 0;
        return Fuzzysearch(name, 'Name', artist);

    },


    //get top result by search name
    //params: Name
    getTop: async function(Name) {

        const artist = await this.getArtistProfile(Name);
        //console.log(artist)
        if (artist) {
            return artist[0]._id
        }
        return 0;

    },

    //get all playlists
    getPlaylists: async function() {
        let playlist = await playlistDocument.find({ isPublic: true }, (err, playlist) => {
            if (err) return 0;
            return playlist;
        }).catch((err) => 0);
        return playlist;
    },

    //get all tracks
    getTracks: async function() {
        let track = await trackDocument.find({}, (err, track) => {
            if (err) return 0;
            return track;
        }).catch((err) => 0);
        return track;
    },

    //search for an exact match of the name sent
    //params: array, name
    exactmatch: async function(array, name) {

        let firstname;
        if (!array) array = [];
        for (let i = 0; i < array.length; i++) {
            subname = array[i].Name.split(' ');
            firstname = subname[0];
            if (firstname == name) {
                return array[i]._id;
            }
        }
        return 0;

    },

    //get all albums with the name albumName
    //params: albumName, groups, country, limit, offset
    getAlbum: async function(albumName, groups, country, limit, offset) {

        var allalbum;
        let allartists = await artistDocument.find({});
        let artist = await this.exactmatch(allartists, albumName);
        if (artist) {

            allalbum = await artistApi.getAlbums(artist, groups, country, limit, offset);

        } else {
            allalbum = await this.getAlbums();
            if (allalbum.length == 0) return allalbum;
            allalbum = Fuzzysearch(albumName, 'name', allalbum);

        }
        if (!allalbum) allalbum = [];
        Album = []
        for (let i = 0; i < allalbum.length; i++) {
            let albums = await album_api.getAlbumArtist(allalbum[i]._id);
            if (albums) {
                album = {}
                album["_id"] = albums._id
                album["name"] = albums.name
                album["images"] = albums.images
                album["type"] = "Album";
                if (albums) {
                    album["artistId"] = albums.artistId;
                    album["artistName"] = albums.artistName;
                    album["artistType"] = "Artist";

                }
                Album.push(album);
            }
        }
        return Album;

    },

    //get all tracks with Name
    //params: Name
    getTrack: async function(Name, limit, offset) {

        var Track;
        let allartists = await artistDocument.find({});
        let artist = await this.exactmatch(allartists, Name);
        if (artist) {

            Track = await artistApi.getTracks(artist);

        } else {
            const track = await this.getTracks();
            if (track == 0) return track;
            Track = Fuzzysearch(Name, 'name', track);
        }

        trackInfo = []
        if (!Track) Track = [];
        for (let i = 0; i < Track.length; i++) {
            let artist = await artist_api.getArtist(Track[i].artistId)
            tracks = {}
            if (artist) {
                tracks["artistId"] = artist._id
                tracks["artistName"] = artist.Name
                tracks["artistimages"] = artist.images
                tracks["artistType"] = artist.type
            }
            let album = await album_api.getAlbumById(Track[i].albumId)
            if (album) {
                tracks["albumId"] = album._id
                tracks["albumName"] = album.name
                tracks["albumImages"] = album.images
                tracks["albumType"] = album.type
            }
            tracks["_id"] = Track[i]._id
            tracks["name"] = Track[i].name
            tracks["type"] = Track[i].type
            tracks["images"] = Track[i].images
            trackInfo.push(tracks);

        }
        return limitOffset(limit, offset, trackInfo);


    },

    //get top results with Name
    //params: Name
    getTopResults: async function(Name) {
        const artist = await this.getTop(Name);
        if (artist) {
            let artist = await this.getArtistProfile(Name)
            return artist[0]
        }
        let track = await this.getTrack(Name);
        if (track && track.length != 0) {
            return track[0];
        }
        let album = await this.getAlbum(Name);
        if (album && album.length != 0) {
            return album[0];
        }
        let playlist = await this.getPlaylist(Name);
        if (playlist && playlist.length != 0) {
            return playlist[0];
        }
        let profile = await this.getUserProfile(Name);
        if (profile && profile.length != 0) {
            return profile[0];
        }

    },

    //get all artist profile with name
    //params: name
    getArtistProfile: async function(name, limit, offset) {

        let artistsInfo = [];
        let artist = await this.getArtistByname(name);
        if (!artist) artist = [];
        if (artist.length == 0) return 0;
        else {
            for (let i = 0; i < artist.length; i++) {
                artistInfo = {}
                artistInfo["_id"] = artist[i]._id
                artistInfo["name"] = artist[i].Name
                artistInfo["images"] = artist[i].images
                artistInfo["info"] = artist[i].info
                artistInfo["type"] = artist[i].type
                artistInfo["genre"] = artist[i].genre
                artistsInfo.push(artistInfo);

            }
        }
        if (artistsInfo.length == 0) return 0;
        return limitOffset(limit, offset, artistsInfo);

    },


    //get all user profiles with name
    //params: name
    getUserProfile: async function(name, limit, offset) {

        UserInfo = []
        let User = await this.getUserByname(name);
        if (!User) User = [];
        if (User.length == 0) return User;
        else {
            for (let i = 0; i < User.length; i++) {
                if (User[i].userType == "Artist") {
                    continue;
                } else {

                    user = {}
                    user["_id"] = User[i]._id
                    user["displayName"] = User[i].displayName
                    user["images"] = User[i].images
                    user["type"] = User[i].type
                    UserInfo.push(user)
                }
            }

            return limitOffset(limit, offset, UserInfo);
        }

    },

    //get all playlists with Name
    //params Name
    getPlaylist: async function(Name, limit, offset) {

        let playlist = await this.getPlaylists();
        if (playlist && playlist.length == 0) return playlist;
        playlist = Fuzzysearch(Name, 'name', playlist);
        playlistInfo = []
        for (let i = 0; i < playlist.length; i++) {
            if (playlist[i].isPublic) {
                let User = await user_api.getUserById(playlist[i].ownerId)
                Playlist = {}
                if (User) {
                    Playlist["ownerId"] = User._id
                    Playlist["ownerName"] = User.displayName
                    Playlist["ownerImages"] = User.images
                    Playlist["ownerType"] = User.type
                }

                Playlist["_id"] = playlist[i]._id
                Playlist["name"] = playlist[i].name
                Playlist["type"] = playlist[i].type
                Playlist["images"] = playlist[i].images
                playlistInfo.push(Playlist)

            }
        }
        return limitOffset(limit, offset, playlistInfo);
    }

}
module.exports = Search;

//search for name in schema
//params: field, name, schema  
function search(name, field, schema) {

    const searcher = new FuzzySearch(schema, [field], {
        caseSensitive: false,
        sort: true
    });
    const users = searcher.search(name);
    return users;

}

//use fuzzy search to search for field in schema with name
//params: name, field, schema
function Fuzzysearch(name, field, schema) {

    Results = []
    if (!name) name = '';
    subName = name.split(' ');
    let results = search(name, field, schema);
    Results = Results.concat(results);
    for (let i = 0; i < subName.length; i++) {
        results = search(subName[i], field, schema);
        Results = Results.concat(results);
    }
    return removeDupliactes(Results);

}

//remove duplicates from array
//params: values
const removeDupliactes = (values) => {

    let newArray = [];
    let uniqueObject = {};
    if (!values) values = [];
    for (let i in values) {
        objTitle = values[i]['_id'];
        uniqueObject[objTitle] = values[i];
    }

    for (i in uniqueObject) {
        newArray.push(uniqueObject[i]);
    }
    return newArray;
}

function limitOffset(limit, offset, search) {

    let start = 0;
    let end = search.length;
    if (offset != undefined) {
        if (offset >= 0 && offset <= search.length) {
            start = offset;
        }
    }
    if (limit != undefined) {
        if ((start + limit) > 0 && (start + limit) <= search.length) {
            end = start + limit;
        }
    } else {
        limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
        if ((start + limit) > 0 && (start + limit) <= search.length) {
            end = start + limit;
        }
    }
    search.slice(start, end);
    return search;
}