const router = require('express').Router();
const passport = require('passport');

// initialize the strategy
require('./facebook-authentication')(passport);

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',passport.authenticate('facebook', { successRedirect: '/auth/logged',failureRedirect: '/login' }));


module.exports = router;