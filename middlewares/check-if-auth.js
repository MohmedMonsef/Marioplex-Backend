const jwt=require('jsonwebtoken');
const jwtSecret = require('../config/jwt-key').secret;
function auth(req,res,next){

  // check the jwt token user sends in the header
    

const token=req.header('x-auth-token');

if(!token){req.isAuth = false;next();}

try{
const decoded=jwt.verify(token,jwtSecret);
req.user=decoded;
req.isAuth = true;
next();
}
catch(ex){
 
    req.isAuth = false;
    next();
}

};
module.exports={auth};