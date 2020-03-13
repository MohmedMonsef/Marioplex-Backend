var spotify =require('../models/DB');
var users=spotify.user;
const bcrypt=require('bcrypt');
async function checkmail(email){
   
    let user=await users.findOne({email:email});
    
    if(!user)
    {
        return false;
    }
     return user;
};

async function updateforgottenpassword(email){
    let user=await users.findOne({email:email});
    if(!user){
        return false;
    }
    let password=user.displayName+"1234";
    const salt=await bcrypt.genSalt(10);
    let hashed=await bcrypt.hash(password,salt);
        user.password=hashed;
       await user.save();
        return password;
};
module.exports={
    checkmail,
    updateforgottenpassword
};