const router = require('express').Router();

const browse =require('../public-api/browse-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');

// get album
router.get('/browse/categories/:category_id',checkAuth,async (req,res)=>{
    
    const categoryId = req.params.category_id;
   
    const category = await browse.getCategoryById(categoryId);
    if(!category) res.sendStatus(404); //not found
    else res.send(category); 

})
router.get('/browse/categories',checkAuth,async (req,res)=>{
    
    const category = await browse.getCategoryies();
    if(category.length==0) res.sendStatus(404); //not found
    else res.send(category); 

})
module.exports = router;