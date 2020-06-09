const router = require('express').Router();

const Album = require('../source/album-api');
const User = require('../source/user-api');
const { auth: checkAuth } = require('../middlewares/is-me');
const { auth: checkIfAuth } = require('../middlewares/check-if-auth');
const RateLimit = require('express-rate-limit');
const limitOffset = require('../middlewares/limit-offset');
// add rate limiting
const limiter = RateLimit({
    windowMs: 60 * 1000,
    max: 30

});
router.delete('/me/albums', checkAuth, limiter, async(req, res, next) => {
    if (req.body.ids == undefined) {
        res.status(403).json({
            message: 'These albums can not be Unsaved'
        });
    }
    const albumId = req.body.ids.split(',');
    const userId = req.user._id;
    const user = await User.getUserById(userId);
    if (!user) res.status(403);
    else {
        const album = await Album.unsaveAlbum(user, albumId).catch(next);
        if (!album) res.status(404).json({
            message: 'album has not been saved before'

        }); //not found
        else res.status(200).json({
            message: 'album has been unsaved suceesfully'
        })
    }

})

router.put('/me/Albums', checkAuth, limiter, async(req, res, next) => {
    if (req.body.ids == undefined) {
        res.status(403).json({
            message: 'These albums can not be saved'
        });
    }
    const albumId = req.body.ids.split(',');
    const userId = req.user._id;
    const user = await User.getUserById(userId);
    if (!user) res.status(403);
    else {
        const album = await Album.saveAlbum(user, albumId).catch(next);
        if (!album) res.status(404).json({
            message: 'album has been already saved'
        }); //not found
        else if (album == 2) {
            res.status(403).json({
                message: 'These albums can not be saved'
            });
        } else res.status(200).json({
            message: 'album has been save suceesfully'
        })
    }
})

// get album
router.get('/albums/:album_id', checkIfAuth, limiter, async(req, res, next) => {

    const albumId = req.params.album_id;
    let userId = undefined;
    if (req.isAuth)
        userId = req.user._id;
    const album = await Album.getAlbumArtist(albumId, userId, req.isAuth).catch(next);
    if (!album) res.status(404).send('NO Albums found'); //not found
    else res.status(200).send(album);

})

router.get('/albums', limiter, async(req, res, next) => {
    if (req.body.ids == undefined) {
        res.status(404).json({
            message: 'no albums found'
        });
    }
    var albumIds = req.body.ids.split(',');

    album = await Album.getAlbums(albumIds).catch(next);
    if (!album) res.status(404).json({
        message: 'no albums found'
    }); //not found
    else {
        specifiedAlbums = limitOffset(req.limit, req.offset, album);
        res.status(200).send(specifiedAlbums);
    }

})
router.get('/Albums/numberOfLikes/:id', limiter, async(req, res, next) => {
      if (req.params.id == undefined) { return res.status(403).send('Artist ID is undefined'); }
      const albumId = req.params.id;
      //GET THE ARTIST WITH THE GIVEN ID
      const likesPerday = await Album.getAlbumNumberOfLikesInDay(albumId).catch(next);;
      const likesPerMonth = await Album.getAlbumNumberOfLikesInMonth(albumId).catch(next);;
      const likesPerYear = await Album.getAlbumNumberOfLikesInYear(albumId).catch(next);;
      //IF NO SUCH ARTIST RETURN 404 NOT FOUND ELSE RETURN STATUS 200 WITH THE ARTIST
      if (likesPerday==-1||likesPerMonth==-1||likesPerYear==-1) return res.status(404).send('');
      else return res.status(200).send({'numOfLikes': [likesPerday,likesPerMonth,likesPerYear] });

  });
router.get('/albums/:id/tracks', checkIfAuth, limiter, async(req, res, next) => {

    const albumId = req.params.id;
    let user = undefined;
    if (req.isAuth)
        user = await User.getUserById(req.user._id);
    const tracks = await Album.getTracksAlbum(albumId, user, req.isAuth).catch(next);
    if (!tracks) {
        res.status(404).json({
            message: 'no tracks found'
        });
    } //not found
    else {
        res.status(200).json({ tracks });
    }

})
router.get('/albums/listeners-per-day/:album_id', limiter, async(req, res) => {
    try {
        const albumId = req.params.album_id;
        const year = req.query.year;
        const day = req.query.day;
        const month = req.query.month;
        const num = await Album.getAlbumListenersPerDay(albumId, year, month, day);
        res.status(200).json({ 'numberOfListners': num });
    } catch (ex) {
        res.status(400).send({ 'error': 'error in making the request' });
    }
})

router.get('/albums/listeners-per-month/:album_id', limiter, async(req, res) => {
    try {
        const albumId = req.params.album_id;
        const year = req.query.year;
        const month = req.query.month;
        const num = await Album.getAlbumListenersPerMonth(albumId, year, month);
        res.status(200).json({ 'numberOfListners': num });
    } catch (ex) {
        res.status(400).send({ 'error': 'error in making the request' });
    }
})
router.get('/albums/listeners-per-year/:album_id', limiter, async(req, res) => {
    try {
        const albumId = req.params.album_id;
        const year = req.query.year;
        const num = await Album.getAlbumListenersPerYear(albumId, year);
        res.status(200).json({ 'numberOfListners': num });
    } catch (ex) {
        res.status(400).send({ 'error': 'error in making the request' });
    }
})
module.exports = router;