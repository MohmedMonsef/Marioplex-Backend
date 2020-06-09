const router = require('express').Router();
const Artist = require('../source/artist-api');
const Album = require('../source/album-api');
const Player = require('../source/player-api');
const User = require('../source/user-api');
const Playlist = require('../source/playlist-api');
const Browse = require('../source/browse-api');
const { auth: checkAuth } = require('../middlewares/is-me');
const RateLimit = require('express-rate-limit');
// add rate limiting
const limiter = RateLimit({
    windowMs: 60 * 1000,
    max: 30

});
// to get new-releases albums
router.get('/browse/new-releases', limiter, async(req, res) => {
    const new_releases = await Album.getNewReleases();
    if (!new_releases) res.status(403).send('can not get albums');
    else res.send(new_releases);
});
// to get genre
router.get('/browse/genre', limiter, async(req, res) => {
    const genre = await Browse.getGenreList();
    if (!genre) res.status(403).send('can not get genres');
    else res.send(genre);

});

// to get popular albums
router.get('/browse/popular-albums', limiter, async(req, res) => {
    const popularAlbums = await Album.getPopularAlbums();
    if (!popularAlbums) res.status(403).send('can not get albums');
    else res.send(popularAlbums);
})

// to get popular artists
router.get('/browse/popular-artists', limiter, async(req, res) => {
    const popularArtist = await Artist.getPopularArtists();
    if (!popularArtist) res.status(403).send('can not get artists');
    else res.send(popularArtist);
})

// to get popular playlists
router.get('/browse/popular-playlists', limiter, async(req, res) => {
    const popularPlaylists = await Playlist.getPopularPlaylists();
    if (!popularPlaylists) res.status(403).send('can not get playlists');
    else res.send(popularPlaylists);
})

// to get recently-playing
router.get('/browse/recently-playing', checkAuth, limiter, async(req, res) => {
    const user = await User.getUserById(req.user._id);
    if (user) {
        const recentlyPlaying = await Player.getRecentlyHomePage(user);
        if (!recentlyPlaying) res.status(400).send('do not have a recently playing');
        else res.send(recentlyPlaying);
    } else res.status(403).send('not user');
})

module.exports = router;