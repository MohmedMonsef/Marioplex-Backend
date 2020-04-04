const express=require('express');
const router=express.Router();
const bodyParser=require('body-parser');
var users=require('../public-api/user-api');
var sendmail=require('../forget-password/sendmail');

var jsonparser = bodyParser.json();


router.post('/login/forgetpassword',jsonparser,async function(req,res)
{
    let email=req.body.email;
    let user=await users.checkmail(email);
    
    if(!user)
    {
        res.status(403).send('THERE IS NO SUCH USER');
    }
    else 
    {

       let newPass= await users.updateforgottenpassword(user);
       res.status(200).send("YOUR PASSWORD IS UPDATED");
        sendmail(email,newPass);
       
    }

});
module.exports=router;