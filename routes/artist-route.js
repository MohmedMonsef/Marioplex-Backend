const router = require('express').Router();
//var progress = require('progress-stream');
const crypto = require('crypto');
const path = require('path');
const Artist = require('../public-api/artist-api');
const Track = require('../public-api/track-api');
const User = require('../public-api/user-api');
const Album = require('../public-api/album-api')
const { auth: checkAuth } = require('../middlewares/is-me');
const { content: checkContent } = require('../middlewares/content');
const { isArtist: checkType } = require('../middlewares/check-type');
const { upload: uploadTrack } = require('../middlewares/upload-tracks');

// get Artist - Path Params : artist_id
router.get('/Artists/:artist_id', checkAuth, async(req, res) => {
    const artistID = req.params.artist_id;
    //GET THE ARTIST WITH THE GIVEN ID
    const artist = await Artist.getArtist(artistID);
    //IF NO SUCH ARTIST RETURN 404 NOT FOUND ELSE RETURN STATUS 200 WITH THE ARTIST
    if (!artist) return res.status(404).send("");
    else return res.status(200).send(artist);

});

// get Artists - Query Params : artists_ids
router.get('/Artists', [checkAuth], async(req, res) => {
    //SPLIT THE GIVEN COMMA SEPERATED LIST OF ARTISTS IDS
    const artistsIDs = req.query.artists_ids.split(',');
    //GET AN ARRAY OF ARTISTS WITH THE GIVEN IDS
    const artists = await Artist.getArtists(artistsIDs);
    //IF THE ARRAY IS EMPTY RETURN 404 NOT FOUND ELSE RETURN THE ARTISTS OBJECTS ARRAY
    if (artists.length == 0) return res.status(404).send({ error: "artists with those id's are not found" });
    else return res.status(200).json(artists);
});

// get Albums - Path Params : artist_id -Query Params : Album Specifications
router.get('/Artists/:artist_id/Albums', [checkAuth], async(req, res) => {
    //GET ARRAY OF ALBUMS FOR AN ARTIST WITH THE SPECIFICATIONS GIVEN
    const albums = await Artist.getAlbums(req.params.artist_id, req.query.groups, req.query.country, req.query.limit, req.query.offset);
    //IF THE ARRAY IS EMPTY RETURN 404 ELSE RETURN 200 WITH THE ALBUMS ARRAY
    if (albums.length == 0 || albums == 0) return res.status(404).send({ error: "albums with those specifications are not found" });
    else return res.status(200).json(albums);
});
//get Tracks - Path Params : artist_id
router.get('/Artists/:artist_id/Tracks', [checkAuth], async(req, res) => {
    //GET THE GIVEN ARTIST TRACKS
    const tracks = await Artist.getTracks(req.params.artist_id);
    if (tracks.length == 0 || tracks == 0) return res.status(404).send({ error: "tracks are not found" });
    else return res.status(200).json(tracks);
});
// get RelatedArtists - Path Params : artist_id
router.get('/Artists/:artist_id/related_artists', [checkAuth], async(req, res) => {
    //GET THE RELATED ARTISTS BY GENRE TO THE GIVEN ARTIST
    const artists = await Artist.getRelatedArtists(req.params.artist_id);
    //RETURN 404 IF EMPTY ELSE RETURN THE ARTISTS
    if (artists.length == 0 || artists == 0) return res.status(404).send({ error: "no artists are found" });
    else return res.status(200).json(artists);
});

// get Top Tracks - Path Params : artist_id
router.get('/Artists/:artist_id/top-tracks', [checkAuth], async(req, res) => {
    //GET THE TOP TRACKS OF AN ARTIST IN A SPECIFIC COUNTRY
    const tracks = await Artist.getTopTracks(req.params.artist_id, req.query.country);
    if (tracks.length == 0 || tracks == 0) return res.status(404).send({ error: "no top tracks in this country are not found" });
    else return res.status(200).json(tracks);
});
// create album 
router.put('/Artists/me/Albums', [checkAuth, checkType, checkContent], async(req, res) => {
    //GET THE CURRENT ARTIST USER
    const artist = await Artist.findMeAsArtist(req.user._id);
    //ADD AN ALBUM TO THIS USER
    const artistAlbum = await Artist.addAlbum(artist._id, req.body.name, req.body.label, req.body.availablemarkets, req.body.albumtype, req.body.releaseDate, req.body.genre);
    if (!artistAlbum) return res.status(404).send(" ");
    else return res.status(200).send(artistAlbum);
});

// upload tracks - Path Params : album_id
router.post('/artists/me/albums/:album_id/tracks', checkAuth, checkType, async(req, res) => {

    // only artist upload songs
    const artist = await Artist.findMeAsArtist(req.user._id);
    if (!artist) { res.status(403).json({ "error": "not an artist" }); return 0; };
    if (await Artist.checkArtisthasAlbum(artist._id, req.params.album_id)) {
        // encrypt file name and send it to request to multer
        let filename = crypto.randomBytes(16, async(err, buf) => {
            if (err) {
                return 0;
            }


            return filename = buf.toString('hex') + path.extname(req.query.name);
        });
        let availableMarkets = req.query.availableMarkets ? req.query.availableMarkets.split(",") : [];
        // set up key and keyId to be base64 string
        let key = Buffer.from(req.query.key, 'hex').toString('base64').replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/, "");
        let keyId = Buffer.from(req.query.keyId, 'hex').toString('base64').replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/, "");

        const track = await Track.createTrack(String(filename), req.query.name, Number(req.query.trackNumber), availableMarkets, artist._id, req.params.album_id, Number(req.query.duration), key, keyId);
        if (!track) { res.status(404).send("cannot create track in tracks"); return 0; }
        const addTrack = await Artist.addTrack(artist._id, track._id);
        if (!addTrack) { res.status(404).send("cannot create track in artist"); return 0; }
        const addTrackAlbum = await Album.addTrack(req.params.album_id, track);
        if (!addTrackAlbum) { res.status(404).send("cannot create track in album"); return 0; }
        req.trackID = track._id;
        req.filename = filename;
        let isUploaded = 0;
        // upload track
        uploadTrack.fields([{ name: "high" }, { name: "medium" }, { name: "low" }, { name: "review" }, { name: "high_enc" }, { name: "medium_enc" }, { name: "low_enc" }])(req, res, (err) => {
            if (err) {
                res.status(403).send({ "error": err.error });
                isUploaded = -1;
                return 0;
            } else {
                res.status(200).json({ "success": "uploaded succesfully" });
                isUploaded = 1;

            }
        });

        let uploadInterval = setInterval(function() {
            if (isUploaded != 1) {
                console.log('still uploading.....')

            } else {
                console.log('end update')

                clearInterval(uploadInterval);
            }
        }, 1000)

    } else {
        res.status(403).send({ "error": "artist doesnt own the album" })
    }


    // update artist details 
    router.put('/Artist/update', [checkAuth, checkType, checkContent], async(req, res) => {
        let genre;
        if (req.body.genre) genre = req.body.genre.split(',');
        const artist = await Artist.updateArtist(req.user._id, req.body.name, genre, req.body.info);
        if (artist) res.status(200).send(artist);
        else res.status(400).send({ error: "can not update " });
    });

})

//CLAIM USER TO ARTIST
router.post('/me/ToArtist', [checkAuth], async(req, res) => {
    if (req.body.genre) {
        let genre = req.body.genre.split(',');
        //SEND THE REQUEST IF THE USER IS ALREADY AN ARTIST THEN RETURN 403 ELSE RETURN 200
        let isartist = await User.promoteToArtist(req.user._id, req.body.info, req.body.name, genre);
        if (!isartist) { return res.status(403).send("sorry you can't be an Artist"); }
        return res.status(200).send("Artist Succeded");
    } else return res.status(403).send("should give me genre");

});


module.exports = router;