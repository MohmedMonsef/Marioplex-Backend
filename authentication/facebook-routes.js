const router = require('express').Router();
const passport = require('passport');
const token = require('../config/generate-token');
// initialize passport
require('./passport-config')(passport);
// initialize the strategy
require('./facebook-authentication')(passport);




router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',passport.authenticate('facebook', { session: false, successRedirect: '/',failureRedirect: '/login' }));


module.exports = router;