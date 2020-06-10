const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const jwtSeret = require('../config/jwtconfig');
var User = require('../source/user-api');
var sendmail = require('../source/sendmail');
const { auth: checkAuth } = require('../middlewares/is-me');
var jsonparser = bodyParser.json();
const rateLimit = require('express-rate-limit');
// add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 2

});

router.post('/login/forgetpassword', jsonparser, limiter, async function(req, res) {
    try{
    let email = req.body.email;
    let user = await User.checkmail(email);

    if (!user) {
        res.status(404).send('THERE IS NO SUCH USER');
    } else {
        var token = jwt.sign({ _id: user._id, product: user.product, userType: user.userType }, jwtSeret.secret, {
            expiresIn: '874024h'
        });
        await sendmail(email, token, 'password');
        res.status(200).send('PLEASE CHECK YOUR MAIL');

    }
}catch(ex){
    res.status(400).send({ 'error': 'error in making the request' });
}

});
router.post('/login/reset_password', checkAuth, limiter, async(req, res) => {
    try{
    let user = await User.getUserById(req.user._id);

    let newPass = await User.updateforgottenpassword(user, req.body.password);
    if (newPass) {
        return res.status(200).send('PASSWORD IS UPDATED');
    } else {
        return res.status(400).send('PASSWORD CAN NOT BE UPDATED');
    }
}catch(ex){
    res.status(400).send({ 'error': 'error in making the request' });
}


});
module.exports = router;