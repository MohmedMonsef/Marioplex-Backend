const express=require('express');
const router=express.Router();
const bodyParser=require('body-parser');
var users=require('../users/user');
var sendmail=require('../ForgetPassword/sendmail');

var jsonparser = bodyParser.json();

router.get('/',function(req,res)
{
    res.render('ForgetPass');
});
router.post('/',jsonparser,async function(req,res)
{
    let email=req.body.email;
    let user=await users.checkmail(email);
    
    if(!user)
    {
        res.status(403).send('THERE IS NO SUCH USER');
    }
    else 
    {

       let newPass= await users.updateforgottenpassword(email);
       if(!newPass){return res.status(403).send("THERE IS NO SUCH USER");}
       else
       {
       res.status(200).send("YOUR PASSWORD IS UPDATED");
        sendmail(email,newPass);
       }
    }

});
module.exports=router;