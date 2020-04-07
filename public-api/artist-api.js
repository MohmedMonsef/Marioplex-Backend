const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');
const spotify=require('../models/db');

const Track=require('./track-api');


const Artist = {

    //CREATE AN ARTIST - PARAMS: user-info-name-Genre
    createArtist: async function(user, Info, name, Genre) {
        var userName;
        //CHECK THE GIVEN NAME IF NULL THEN = USERNAME
        if (!name) userName = user.displayName;
        else userName = name;
        let artist = new artistDocument({
            info: Info,
            popularity: 0,
            genre: Genre,
            type: "Artist",
            Name: userName,
            userId: user._id,
            popularity: 0,
            images: [],
            addAlbums: [],
            addTracks: []

        });
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
            if (artists.length < 20) limit = artists.length;
            else limit = 20;
            for (let i = 0; i < limit; i++) {

                reArtists.push({ genre: artists[i].genre, type: 'artist', name: artists[i].Name, images: artists[i].images, id: artists[i]._id, info: artists[i].info });
            }
        }
        const reArtistsJson = { artists: reArtists };
        return reArtistsJson;
    },
    //CHECK IF THE ARTIST HAS A SPECIFIC ALBUM - PARAMS: artistId,albumId
    checkArtisthasAlbum:async function(artistId,albumId){
        if (await albumDocument.findById(albumId)){
            const artist=await this.getArtist(artistId);
            if(!artist) return 0;
            if(artist.addAlbums){
                return await artist.addAlbums.find(album => album.albumId == albumId);    
            }  
        }
        return 0;
    },
    //GET ARTIST - PARAMS : ArtistID
    getArtist: async function(ArtistID) {

        const artist = await artistDocument.findById(ArtistID, (err, artist) => {
            if (err) return 0;
            return artist;
        }).catch((err) => 0);
        return artist;
    },

    // CREATE ALBUM FOR AN ARTIST - PARAMS : ArtistID-Name,Label,Avmarkets,Albumtype,ReleaseDate,Genre
    addAlbum: async function(ArtistID, Name, Label, Avmarkets, Albumtype, ReleaseDate, Genre) {
        if (!await this.getArtist(ArtistID)) return 0;
        let spotifyAlbums = spotify.album;
        let album = await new spotifyAlbums({
            name: Name,
            albumType: Albumtype,
            popularity: 0,
            genre: Genre,
            releaseDate: ReleaseDate,
            availableMarkets: Avmarkets,
            label: Label,
            images: [],
            artistId: ArtistID,
            type: "Album",
            popularity: 0,
            hasTracks: []

        });
        await album.save(function(err, albumobj) {
            album = albumobj;
        });
        const artist = await artistDocument.findById(ArtistID);
        artist.addAlbums.push({
            albumId: album._id
        });
        await artist.save();
        return album;
    },
    // CREATE TRACK FOR AN ARTIST -PARAMS : ArtistID,trackid
    addTrack: async function(ArtistID, trackid) {
        const artist = await artistDocument.findById(ArtistID);
        artist.addTracks.push({
            trackId: trackid
        });
        await artist.save();

    },
    // GET SEVERAL ARTISTS - params : artistsIDs  -ARRAY-
    getArtists: async function(artistsIDs) {
        let artists = [];
        for (let artistID of artistsIDs) {
            let artist = await this.getArtist(artistID);
            if (!artist) continue
            artists.push(artist);
        }
        return artists;
    },
    // GET SPECIFIC ALBUMS - Params :artistID,groups,country,limit,offset
    getAlbums: async function(artistID, groups, country, limit, offset) {
        let SpecificAlbums = [];
        let albums = {};
        let artist = await this.getArtist(artistID);
        if (!artist) return 0;
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
                    SpecificAlbums.push(albums[Album]);
                }
            }
        } else if (groups == undefined && country != undefined) {
            for (let Album in albums) {
                if (albums[Album].availableMarkets.includes(country)) {
                    SpecificAlbums.push(albums[Album]);
                }
            }
        } else if (groups != undefined && country == undefined) {
            for (let Album in albums) {
                if (groups.includes(albums[Album].albumType)) {
                    SpecificAlbums.push(albums[Album]);
                }
            }
        } else {
            for (let Album in albums) {
                SpecificAlbums.push(albums[Album]);
            }
        }
        //HANDLE THE LIMIT - OFFSET FOR THE ARRAY
        let start = 0;
        let end = SpecificAlbums.length;
        if (offset != undefined) {
            if (offset >= 0 && offset <= SpecificAlbums.length) {
                start = offset;
            }
        }
        if (limit != undefined) {
            if ((start + limit) > 0 && (start + limit) <= SpecificAlbums.length) {
                end = start + limit;
            }
        }
        SpecificAlbums.slice(start, end);
        return SpecificAlbums;
    },
    //GET RELATED ARTISTS TO A GIVEN ARTIST - Params: artistID
    getRelatedArtists: async function(artistID) {
        let Artists;
        artistDocument.find({}, function(err, artists) {
            Artists = artists;
        });
        let artist = await this.getArtist(artistID);
        if (!Artists) return 0;
        if (!artist) return 0;
        let RelatedArtists = [];
        //FILTER THE ARTISTS BASED ON THEIR GENRE
        for (let Artist in Artists) {
            for (var i = 0; i < Artists[Artist].genre.length; i++) {
                for (var j = 0; j < artist.genre.length; j++) {
                    if (Artists[Artist].genre[i] == artist.genre[j]) {
                        if (!RelatedArtists.find(artist1 => artist1._id == Artists[Artist]._id))
                            RelatedArtists.push(Artists[Artist]);
                        continue;
                    }
                }
            }
        }
        //HANDLE MAX NUMBER TO RETURN
        if (RelatedArtists.length > 20) RelatedArtists.slice(0, 20);
        return RelatedArtists;
    },
    //FIND THE CURRENT ARTIST USER - Params:userId
    findMeAsArtist: async function(userId) {

        const artist = await artistDocument.findOne({ userId: userId }, (err, artist) => {
            if (err) return 0;
            return artist;
        }).catch((err) => 0);
        return artist;
    },

    // GET TOP TRACKS IN A COUNTRY FOR AN ARTIST
    getTopTracks: async function(artistID, country) {
        let TopTracks = [];
        let tracks = {};
        let artist = await this.getArtist(artistID);
        if (!artist) return 0;
        for (let i = 0; i < artist.addTracks.length; i++) {
            let track = await Track.getTrack(artist.addTracks[i].trackId);
            if (track) { tracks[artist.addTracks[i].trackId] = track; console.log(track); }
        }
        //FILTER TRACKS BASED ON THE COUNTRY
        for (let track in tracks) {
            if (tracks[track].availableMarkets.includes(country)) {
                TopTracks.push(tracks[track]);
            }
        }
        //SORT TRACKS BY popularity
        TopTracks.sort((a, b) => (a.popularity > b.popularity) ? -1 : 1);
        TopTracks.slice(0, 10);
        return TopTracks;
    },
    //GET TRACKS FOR AN ARTIST - Params:artistID
    getTracks: async function(artistID) {
        let SpecificTracks = [];
        let tracks = {};
        let artist = await this.getArtist(artistID);
        if (!artist) return 0;
        for (let i = 0; i < artist.addTracks.length; i++) {
            let track = await Track.getTrack(artist.addTracks[i].trackId);
            if (track) { tracks[artist.addTracks[i].trackId] = track; }
        }
        for (let Track in tracks) {
            SpecificTracks.push(tracks[Track]);
        }


        return SpecificTracks;
    },
}

module.exports = Artist;