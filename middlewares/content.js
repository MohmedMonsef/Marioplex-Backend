function content(req,res,next){
    if  (!req.accepts('application/json')) return res.status(406).send('Not Accepted');
    next();
    };
module.exports={content};