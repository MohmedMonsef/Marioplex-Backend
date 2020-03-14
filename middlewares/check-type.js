function isArtist(req,res,next){

    if(req.user.type!="Artist") return res.status(403).send('Access Denied');
    
    next();
    
    };
module.exports=isArtist;