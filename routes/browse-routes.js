const router = require('express').Router();
const Browse = require('../source/browse-api');
const RateLimit = require("express-rate-limit");
// add rate limiting
const limiter = RateLimit({
    windowMs: 60 * 1000,
    max: 30

});
// get  category
router.get('/browse/categories/:category_id', limiter, async(req, res) => {
    const categoryId = req.params.category_id;
    const category = await Browse.getCategoryById(categoryId);
    if (!category) res.sendStatus(404); //not found
    else res.send({ "category": category });
})
router.get('/browse/categories/:category_id/playlists', limiter, async(req, res) => {
    const categoryId = req.params.category_id;
    const playlists = await Browse.getCategoryPlaylists(categoryId, req.body.limit, req.body.offset);
    if (!playlists) res.sendStatus(404); //not found
    else res.send({ "playlists": playlists });
})

// get categories
router.get('/browse/categories', limiter, async(req, res) => {
    const category = await Browse.getCategoryies();
    if (category.length == 0) res.sendStatus(404); //not found
    else res.send({ "category": category });
})
module.exports = router;