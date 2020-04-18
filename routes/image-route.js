const router = require('express').Router();
const crypto = require('crypto');
const path = require('path');
const Image = require('../public-api/image-api')
const {auth:checkAuth} = require('../middlewares/is-me');
const {isArtist:checkType} = require('../middlewares/check-type');
const {upload:uploadImage} = require('../middlewares/upload-image');
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken');
const jwtSecret = require('../config/jwt-key').secret;
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
            res.status(403).send({"error":"cannot add image to db"});
            return 0;
      }else{
          res.status(200).json({"success":"uploaded succesfully"});
      }
      });




})

// update image for a user for different entities with a source id 
router.post('/images/update/:source_id',checkAuth,async (req,res)=>{
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
    const imageId = await Image.updateImage(userId,sourceId,belongsTo,image);
    if(!imageId){
        res.status(403).json({"error":"cannot add image to db"});
        return 0;
    }
    // set request imageId to the imageId to be uploaded to multer
    req.imageId = imageId;
    uploadImage.fields([{name:"image"}])(req,res,(err)=>{
        if(err){ 
            res.status(403).send({"error":"cannot update image"});
            return 0;
      }else{
          res.status(200).json({"success":"updated succesfully"});
      }
      });




})
// get image 
router.get('/images/:image_id',async (req,res)=>{
    // get token as query parameter
    const token=req.query.token;

    if(!token){return res.status(401).send('No Available token');}

    try{
    const decoded=jwt.verify(token,jwtSecret);
    req.user=decoded;
   
    }
    catch(ex){
    
    return res.status(400).send('Invalid Token');
    }
    const imageId = req.params.image_id;
    // get file from gridfs
    gfsImages.files.findOne({"metadata.imageId":mongoose.Types.ObjectId(imageId)},function (err, file) {
        if (err) {res.send(500).send("server error while sending image");return 0;}
        // send range response 
        const range = req.headers.range;
        if(range){
        console.log('range')
        var parts = req.headers['range'].replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];
    
        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : file.length -1;
        var chunksize = (end-start)+1;      
        res.writeHead(206, {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': file.contentType
        });
        gfsImages.createReadStream({
            _id:file._id,
            range:{
                startPos: start,
                    endPos: end
            }
        }).pipe(res);
        }else{
            // if doesnt support range then send it sequential using pipe method in nodejs
            res.header('Content-Length', file.length);
            res.header('Content-Type', file.contentType);

            gfsImages.createReadStream({
                _id: file._id
            }).pipe(res);
        }
    })
}) 

// delete image 
router.delete('/images/delete/:image_id',checkAuth,async (req,res)=>{
    const imageId = req.params.image_id;
    const userId = req.user._id;
    const belongsTo = req.query.belongs_to;
    const sourceId = req.query.source_id;
    if(!belongsTo || !sourceId){
        res.status(403).send({"error":"no source or belong_to where supplied"});
        return 0;
    }
    const deletedImage = await Image.deleteImage(imageId,userId,sourceId,belongsTo);
    if(!deletedImage) res.status(404).json({"error":"image not deleted"});
    else res.status(200).json({"success":"image deleted"})
})


module.exports = router;