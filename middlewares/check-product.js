function isPremium(req, res, next) {
    if (req.user.product != "premium") return res.status(403).send('Access Denied');
    next();
};
module.exports = { isPremium };