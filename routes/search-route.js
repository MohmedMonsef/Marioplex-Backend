const router = require('express').Router();
const checkMonooseObjectID = require('../validation/mongoose-objectid')
const Search = require('../source/search-api');
const User = require('../source/user-api');
const { auth: checkAuth } = require('../middlewares/is-me');
const rateLimit = require("express-rate-limit");
// add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30

});

//SEARCH FOR A WORD OR CHAR, QUERY PARAMS: name, type
router.get('/search', limiter, async(req, res, next) => {

    const name = req.query.name;
    const type = req.query.type.split(',');
    const limit = req.body.limit;
    const offset = req.body.offset;
    let searchResult = {};
    for (let i = 0; i < type.length; i++) {
        if (type[i] == "top") {
            const artist = await Search.getTopResults(name).catch(next);
            if (artist == {}) searchResult["top"] = [] //not found
            else searchResult["top"] = artist
        } else if (type[i] == "track") {
            const artist = await Search.getTrack(name, limit, offset).catch(next);
            if (artist.length == 0) searchResult["track"] = [] //not found
            else searchResult["track"] = artist
        } else if (type[i] == "album") {

            const albums = await Search.getAlbum(name, req.query.groups, req.query.country, req.query.limit, req.query.offset).catch(next);
            if (albums.length == 0) searchResult["album"] = [] //not found
            else searchResult["album"] = albums

        } else if (type[i] == "artist") {
            const artist = await Search.getArtistProfile(name, limit, offset).catch(next);
            if (artist == 0) searchResult["artist"] = [] //not found
            else searchResult["artist"] = artist
        } else if (type[i] == "playlist") {
            const playlists = await Search.getPlaylist(name, limit, offset).catch(next);
            if (playlists.length == 0) searchResult["playlist"] = [] //not found
            else searchResult["playlist"] = playlists

        } else if (type[i] == "profile") {
            const profiles = await Search.getUserProfile(name, limit, offset).catch(next);
            if (profiles.length == 0) searchResult["profile"] = []; //not found
            else searchResult["profile"] = profiles
        } else {
            continue;
        }
    }
    for (let search in searchResult) {
        if (searchResult[search] != {}) {
            return res.status(200).send(searchResult);
        }
    }
    return res.status(404).send("No results found");

})

router.put('/recently-search', checkAuth, limiter, async(req, res, next) => {
    if (!checkMonooseObjectID([req.query.id, req.user._id])) return res.status(403).send('error in ids !!');
    const userId = req.user._id;
    const user = User.getUserById(userId)
    if (!user) return req.status(403).send('user not found !');
    const addToSearch = await Search.addToRecentlySearch(userId, req.query.id, req.query.type).catch(next);
    if (!addToSearch) return res.status(400).send('not correct data !');
    else res.send('Done');
})
router.delete('/recently-search', checkAuth, limiter, async(req, res, next) => {
    if (!checkMonooseObjectID([req.query.id, req.user._id])) return res.status(403).send('error in ids !!');
    const userId = req.user._id;
    const user = User.getUserById(userId)
    if (!user) return req.status(403).send('user not found !');
    const remove = await Search.removeRecently(userId, req.query.type, req.query.id).catch(next);
    if (!remove) return res.status(400).send('not exist !!');
    else res.send('Done')

})

router.get('/recently-search', checkAuth, limiter, async(req, res, next) => {
    if (!checkMonooseObjectID([req.user._id])) return res.status(403).send('error in ids !!');
    const userId = req.user._id;
    const user = User.getUserById(userId)
    if (!user) return req.status(403).send('user not found !');
    const recentlySearch = await Search.getRecentlySearch(userId).catch(next);
    if (!recentlySearch) return res.status(400).send('not exist !!');
    return res.send(recentlySearch)

})
module.exports = router;