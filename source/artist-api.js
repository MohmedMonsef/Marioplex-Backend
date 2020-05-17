const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const spotify = require('../models/db');
const checkMonooseObjectID = require('../validation/mongoose-objectid');
const Track = require('./track-api');


const Artist = {
    /**
     * 
     * @param {String} artistId
     * @returns {Number} 
     */
    getArtistNumberOfFollowersInMonth: async function(artistId) {
        let artist = await this.getArtist(artistId);
        if (!artist) return -1;
        if (!artist.followed) {artist.followed = []; return 0;}
        var numberOfFollowers = 0;
        var today = new Date();
        for(let i=0;i<artist.followed.length;i++){
            let date=artist.followed[i].date;
            if(date.getMonth() == today.getMonth() &&
            date.getFullYear() == today.getFullYear())
              numberOfFollowers +=1;
        }
        return numberOfFollowers;

    },
    /**
     * 
     * @param {String} artistId
     * @returns {Number} 
     */
    getArtistNumberOfFollowersInDay: async function(artistId) {
        let artist = await this.getArtist(artistId);
        if (!artist) return -1;
        if (!artist.followed) {artist.followed = []; return 0;}
        var numberOfFollowers = 0;
        var today = new Date();
        for(let i=0;i<artist.followed.length;i++){
            let date=artist.followed[i].date;
            if(date.getMonth() == today.getMonth() &&
            date.getFullYear() == today.getFullYear() &&
            date.getDay() == today.getDay())
               numberOfFollowers +=1;
        }
        return numberOfFollowers;
    },
    /**
     * 
     * @param {String} artistId
     * @returns {Number} 
     */
    getArtistNumberOfFollowersInYear: async function(artistId) {
        let artist = await this.getArtist(artistId);
        if (!artist) return -1;
        if (!artist.followed) {artist.followed = []; return 0;}
        var today = new Date();
        var numberOfFollowers = 0;
        if(!artist.followed)artist.followed=[];
        for(let i=0;i<artist.followed.length;i++){
            let date=artist.followed[i].date;
            if(date.getFullYear() == today.getFullYear())
               numberOfFollowers +=1;
        }
        return numberOfFollowers;

    },
    /** 
     *  create an artist
     * @param  {object} user - the user who promote to artist 
     * @param  {string}  info - information about new artist
     * @param {string} name  - the name of new artist if it is undefined his name will be user name
     * @param {Array<string>}  genre - the artist's genres
     * @returns {object}  - artist object
     */
    //CREATE AN ARTIST - PARAMS: user-info-name-Genre
    createArtist: async function(user, info, name, genre) {
        var userName;
        //CHECK THE GIVEN NAME IF NULL THEN = USERNAME
        if (!name) userName = user.displayName;
        else userName = name;
        let artist = new artistDocument({
            info: info,
            popularity: 0,
            genre: genre,
            type: "Artist",
            Name: userName,
            userId: user._id,
            popularity: 0,
            images: [],
            addAlbums: [],
            addTracks: [],
            followed: []

        });
        await artist.save();
        return artist;
    },
    /**
     * update artist
     * @param {string } userId -id of artist as user
     * @param {string} name - the new name of artist
     * @param {Array<string>} genre -array of artist genre   
     * @param {string} info  - information about artist 
     * @returns {Object}
     */
    updateArtist: async function(userId, name, genre, info) {
        if (!checkMonooseObjectID([userId])) return 0;
        artist = await this.findMeAsArtist(userId);
        if (!artist) return 0;
        if (name) artist.Name = name;
        if (genre) artist.genre = genre;
        if (info) artist.info = info;
        await artist.save();
        return artist;
    },
    //GET THE POPULAR ARTIST BASED ON THE POPULARITY
    getPopularArtists: async function() {
        // with - is from big to small and without is from small to big
        var reArtists = []
        const artists = await artistDocument.find({}).sort('-popularity')
        if (artists) {
            var limit; // to limit the num of artists by frist 20 only but should check if num of albums less than 10  
            if (artists.length < Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20) limit = artists.length;
            else limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            for (let i = 0; i < limit; i++) {

                reArtists.push({
                    genre: artists[i].genre,
                    type: 'artist',
                    name: artists[i].Name,
                    images: artists[i].images,
                    id: artists[i]._id,
                    info: artists[i].info,
                    popularity: artists[i]['popularity']
                });
            }
        }
        const reArtistsJson = { artists: reArtists };
        return reArtistsJson;
    },
    /**
     * check if artist has this album or not 
     * @param {string} artistId - the id of artist
     * @param {string} albumId  - the id of album
     * @returns {object} -if this artist not have any album return 0 else if this artist not has this album return undefined else return the object of  artist.addAlbums
     */
    //CHECK IF THE ARTIST HAS A SPECIFIC ALBUM - PARAMS: artistId,albumId
    checkArtisthasAlbum: async function(artistId, albumId) {
        if (!checkMonooseObjectID([artistId, albumId])) return 0;
        if (await albumDocument.findById(albumId)) {
            const artist = await this.getArtist(artistId);
            if (!artist) return 0;
            if (artist.addAlbums) {
                return await artist.addAlbums.find(album => album.albumId + 1 == albumId + 1);
            }
        }
        return 0;
    },
    /**
     * get artist by his id
     * @param {string} artistID -id of artist
     * @returns {object}  -of artist if not found return 0
     */
    //GET ARTIST - PARAMS : ArtistID
    getArtist: async function(artistID) {
        if (!checkMonooseObjectID([artistID])) return 0;
        const artist = await artistDocument.findById(artistID, (err, artist) => {
            if (err) return 0;
            return artist;
        }).catch((err) => 0);
        return artist;
    },
    /**
     * add album to certain artist
     * @param {string} artistId -the id of artist
     * @param {string} name - the name of album
     * @param {string} label -label of album
     * @param {Array<string>} avMarkets -the available markets of this album
     * @param {string} albumType - album type
     * @param {date} releaseDate  -the date this album release
     * @param {string} genre  -the genre of this album
     * 
     * @returns {object} -of album
     */
    // CREATE ALBUM FOR AN ARTIST - PARAMS : ArtistID-Name,Label,Avmarkets,Albumtype,ReleaseDate,Genre
    addAlbum: async function(artistId, name, label, avMarkets, albumType, releaseDate, genre) {
        if (typeof(name) != "string" || typeof(label) != "string") return 0;
        if (!checkMonooseObjectID([artistId])) return 0;
        const artist = await this.getArtist(artistId);
        if (!artist) return 0;
        let spotifyAlbums = spotify.album;
        let album = await new spotifyAlbums({
            name: name,
            albumType: albumType,
            popularity: 0,
            genre: genre,
            releaseDate: releaseDate,
            availableMarkets: avMarkets,
            label: label,
            images: [],
            artistId: artistId,
            type: "Album",
            popularity: 0,
            hasTracks: [],
            releaseDatePercision: "DD-MM-YY"

        });
        await album.save();
       
        artist.addAlbums.push({
            albumId: album._id
        });
        await artist.save();
        return album;
    },
    /**
     * add track to certain album of certain artist
     * @param {string} artistId -the id of artist 
     * @param {string} trackId -the id of the new track
     * 
     */
    // CREATE TRACK FOR AN ARTIST -PARAMS : ArtistID,trackid
    addTrack: async function(artistId, trackId) {
        if (!checkMonooseObjectID([artistId])) return 0;
        const artist = await artistDocument.findById(artistId);
        if (!artist.addTracks) artist.addTracks = [];
        artist.addTracks.push({
            trackId: trackId
        });
        await artist.save();
        return 1;
    },
    /**
     * get artists
     * @param {Array<string>} artistsIds - artists ids
     * @returns {Array<object>} - array of artists object  
     */
    // GET SEVERAL ARTISTS - params : artistsIDs  -ARRAY-
    getArtists: async function(artistsIds) {
        let artists = [];

        if (!artistsIds) artistsIds = [];
        if (!checkMonooseObjectID(artistsIds)) return 0;
        for (let artistId of artistsIds) {

            let artist = await this.getArtist(artistId);
            if (!artist) continue
            artists.push(artist);
        }
        return artists;
    },
    /**
     * get albums for certain artist
     * @param {string} artistId  - artist id 
     * @param {Array<string>} groups - the groups of album
     * @param {string} country -the country 
     * @param {Number} limit -the max number of albums
     * @param {Number} offset - the start number 
     * @returns {JSON} -contain array of albums 
     */
    // GET SPECIFIC ALBUMS - Params :artistID,groups,country,limit,offset
    getAlbums: async function(artistId, groups, country, limit, offset) {
        // if(limit && typeof(limit) != "number" ) return 0;
        if (!checkMonooseObjectID([artistId])) return 0;
        let specificAlbums = [];
        let albums = {};
        let artist = await this.getArtist(artistId);
        if (!artist) return 0;
        if (!artist.addAlbums) artist.addAlbums = [];
        //GET ALL THE ALBUMS OF THIS ARTIST
        for (let i = 0; i < artist.addAlbums.length; i++) {
            albums[artist.addAlbums[i].albumId] = await albumDocument.findById(artist.addAlbums[i].albumId, (err, album) => {
                if (err) return 0;
                return album;
            }).catch((err) => 0);
        }
        //FILTER THE ALBUMS BASED ON THE INPUT
        if (groups != undefined && country != undefined) {
            for (let Album in albums) {
                if (groups.includes(albums[Album].albumType) && albums[Album].availableMarkets.includes(country)) {
                    specificAlbums.push(albums[Album]);
                }
            }
        } else if (groups == undefined && country != undefined) {
            for (let Album in albums) {
                if (albums[Album].availableMarkets.includes(country)) {
                    specificAlbums.push(albums[Album]);
                }
            }
        } else if (groups != undefined && country == undefined) {
            for (let Album in albums) {
                if (groups.includes(albums[Album].albumType)) {
                    specificAlbums.push(albums[Album]);
                }
            }
        } else {
            for (let Album in albums) {
                specificAlbums.push(albums[Album]);
            }
        }
        //HANDLE THE LIMIT - OFFSET FOR THE ARRAY
        let start = 0;
        let end = specificAlbums.length;
        if (offset != undefined) {
            if (offset >= 0 && offset <= specificAlbums.length) {
                start = offset;
            }
        }
        if (limit != undefined) {
            if ((start + limit) > 0 && (start + limit) <= specificAlbums.length) {
                end = start + limit;
            }
        } else {
            limit = Number(process.env.LIMIT) ? Number(process.env.LIMIT) : 20;
            if ((start + limit) > 0 && (start + limit) <= specificAlbums.length) {
                end = start + limit;
            }
        }
        specificAlbums.slice(start, end);
        return specificAlbums;
    },
    /**
     * get related artists of an artist
     * @param {string} artistId  - id of artist
     * @returns {Array<object>} -array of artists
     */
    //GET RELATED ARTISTS TO A GIVEN ARTIST - Params: artistID
    getRelatedArtists: async function(artistId) {
        if (!checkMonooseObjectID([artistId])) return 0;
        let artists;
        artistDocument.find({}, function(err, artistsAll) {
            artists = artistsAll;
        });
        let artist = await this.getArtist(artistId);
        if (!artists) return 0;
        if (!artist) return 0;
        let relatedArtists = [];
        //FILTER THE ARTISTS BASED ON THEIR GENRE
        for (let artistIndx in artists) {
            for (var i = 0; i < artists[artistIndx].genre.length; i++) {
                for (var j = 0; j < artist.genre.length; j++) {
                    if (artists[artistIndx].genre[i] == artist.genre[j]) {
                        if (!relatedArtists.find(artist1 => artist1._id == artists[artistIndx]._id))
                            relatedArtists.push(artists[artistIndx]);
                        continue;
                    }
                }
            }
        }
        //HANDLE MAX NUMBER TO RETURN
        if (relatedArtists.length > 20) relatedArtists.slice(0, 20);
        return relatedArtists;
    },
    /**
     * find the artist by user id
     * @param {string} userId -the id of user
     * @returns {object} -artist
     */
    //FIND THE CURRENT ARTIST USER - Params:userId
    findMeAsArtist: async function(userId) {
        if (!checkMonooseObjectID([userId])) return 0;
        const artist = await artistDocument.findOne({ userId: userId }, (err, artist) => {
            if (err) return 0;
            return artist;
        }).catch((err) => 0);
        return artist;
    },
    /**
     * get top tracks of artist
     * @param {string} artistId -the id of artist 
     * @param {string} country 
     * 
     * @returns {Array<objects>} 
     */
    // GET TOP TRACKS IN A COUNTRY FOR AN ARTIST
    getTopTracks: async function(artistId, country, user) {
        // if(typeof(country) != "string") return 0;
        if (!checkMonooseObjectID([artistId])) return 0;
        let topTracks = [];
        let tracks = {};
        let artist = await this.getArtist(artistId);
        if (!artist) return 0;
        for (let i = 0; i < artist.addTracks.length; i++) {
            let track = await Track.getTrack(artist.addTracks[i].trackId, user);
            if (track) { tracks[artist.addTracks[i].trackId] = track; }
        }

        //FILTER TRACKS BASED ON THE COUNTRY
        for (let track in tracks) {
            if (tracks[track].availableMarkets && tracks[track].availableMarkets.includes(country)) {
                topTracks.push(tracks[track]);
            }
        }
        //SORT TRACKS BY popularity
        topTracks.sort((a, b) => (a.popularity > b.popularity) ? -1 : 1);
        topTracks.slice(0, 10);
        return topTracks;
    },
    /**
     * get tracks 
     * @param {string} artistId -the id of artist
     * @returns {Array} -array has set of tracks   
     */
    //GET TRACKS FOR AN ARTIST - Params:artistID
    getTracks: async function(artistId, user) {
        if (!checkMonooseObjectID([artistId])) return 0;
        let specificTracks = [];
        let tracks = {};
        let artist = await this.getArtist(artistId);
        if (!artist) return 0;
        if (!artist.addTracks) artist.addTracks = [];
        for (let i = 0; i < artist.addTracks.length; i++) {
            let track = await Track.getTrack(artist.addTracks[i].trackId, user);
            if (track) { tracks[artist.addTracks[i].trackId] = track; }
        }
        for (let Track in tracks) {
            specificTracks.push(tracks[Track]);
        }


        return specificTracks;
    },
    checkArtistHasTrack: async function(artist, trackId) {
        if (!artist || !trackId) return 0;
        if (!artist.addTracks) return 0;
        for (let track of artist.addTracks) {
            if (String(track.trackId) == String(trackId)) return 1;
        }
        return 0;
    }
}

module.exports = Artist;