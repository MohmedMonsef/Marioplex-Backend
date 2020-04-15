const router = require('express').Router();
const crypto = require('crypto');
const path = require('path');
const Image = require('../public-api/image-api')
const {auth:checkAuth} = require('../middlewares/is-me');
const {isArtist:checkType} = require('../middlewares/check-type');
const {upload:uploadImage} = require('../middlewares/upload-image');

// upload image for a user for different entities with a source id 
router.post('/images/upload/:source_id',checkAuth,async (req,res)=>{
    const userId = req.user._id;
    const belongsTo = req.query.belongs_to;
    const sourceId = req.params.source_id;
    if(!belongsTo || !sourceId){
        res.status(403).send({"error":"no source or belong_to where supplied"});
        return 0;
    }
    // get image height and width in pixels
    const height = Number(req.query.height);
    const width = Number(req.query.width);
    if(!height || !width){
        res.status(403).send({"error":"no height or width where supplied"});
        return 0;
    } 
    const image = {
        height:height,
        width:width
    }
    // add ids to request object for multer
    req.belongsTo = belongsTo;
    req.sourceId = sourceId;
    // get id of image if saved in db 
    const imageId = await Image.uploadImage(userId,sourceId,belongsTo,image);
    if(!imageId){
        res.status(403).json({"error":"cannot add image to db"});
        return 0;
    }
    // set request imageId to the imageId to be uploaded to multer
    req.imageId = imageId;
    uploadImage.fields([{name:"image"}])(req,res,(err)=>{
        if(err){ 
            res.status(403).send({"error":err.error});
            return 0;
      }else{
          res.status(200).json({"success":"uploaded succesfully"});
      }
      });




})

module.exports = router;