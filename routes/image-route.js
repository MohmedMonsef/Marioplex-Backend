const router = require('express').Router();
const Image = require('../source/image-api')
const { auth: checkAuth } = require('../middlewares/is-me');
const { upload: uploadImage } = require('../middlewares/upload-image');
const rateLimit = require("express-rate-limit");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const checkMonooseObjectID = require('../validation/mongoose-objectid')
    // add rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50

});
// upload image for a user for different entities with a source id 
router.post('/images/upload/:source_id', checkAuth, limiter, async(req, res) => {
    try{
    const userId = req.user._id;
    const belongsTo = req.query.belongs_to;
    const sourceId = req.params.source_id;
    if (!belongsTo || !sourceId) {
        res.status(400).send({ "error": "no source or belong_to where supplied" });
        return 0;
    }
    // get image height and width in pixels
    const height = Number(req.query.height);
    const width = Number(req.query.width);
    if (!height || !width) {
        res.status(400).send({ "error": "no height or width where supplied" });
        return 0;
    }
    const image = {
            height: height,
            width: width
        }
        // add ids to request object for multer
    req.belongsTo = belongsTo;
    req.sourceId = sourceId;
    // get id of image if saved in db 
    const imageId = await Image.uploadImage(userId, sourceId, belongsTo, image);
    if (!imageId) {
        res.status(400).json({ "error": "cannot add image to db" });
        return 0;
    }
    // set request imageId to the imageId to be uploaded to multer
    req.imageId = imageId;
    uploadImage.fields([{ name: "image" }])(req, res, async(err) => {
        if (err) {
            await Image.deleteImage(imageId, userId, sourceId, belongsTo);
            res.status(400).send({ "error": "cannot add image to db" });
            return 0;
        } else {
            res.status(201).json({ "success": "uploaded succesfully", "imageId": imageId });
        }
    });

}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}


})

// update image for a user for different entities with a source id 
router.post('/images/update/:source_id', checkAuth, limiter, async(req, res) => {
    try{
        const userId = req.user._id;
        const belongsTo = req.query.belongs_to;
        const sourceId = req.params.source_id;
        if (!belongsTo || !sourceId) {
            res.status(400).send({ "error": "no source or belong_to where supplied" });
            return 0;
        }
        // get image height and width in pixels
        const height = Number(req.query.height);
        const width = Number(req.query.width);
        if (!height || !width) {
            res.status(400).send({ "error": "no height or width where supplied" });
            return 0;
        }
        const image = {
                height: height,
                width: width
            }
            // add ids to request object for multer
        req.belongsTo = belongsTo;
        req.sourceId = sourceId;
        // get id of image if saved in db 
        const imageId = await Image.updateImage(userId, sourceId, belongsTo, image);
        if (!imageId) {
            res.status(400).json({ "error": "cannot add image to db" });
            return 0;
        }
        // set request imageId to the imageId to be uploaded to multer
        req.imageId = imageId;
        uploadImage.fields([{ name: "image" }])(req, res, async(err) => {
            if (err) {

                await Image.deleteImage(imageId, userId, sourceId, belongsTo);
                res.status(400).json({ "error": "cannot update image" });
                return 0;
            } else {
                res.status(201).json({ "success": "updated succesfully", "imageId": imageId });
            }
        });


    }catch(ex){
        res.status(400).send({ "error": "error in making the request" });
    }

    })
    // get image 
router.get('/images/:image_id', limiter, async(req, res) => {
    try{


    const belongsTo = req.query.belongs_to;

    if (!belongsTo) return res.status(404).send('No belongs to');

    const imageId = req.params.image_id;
    if (!checkMonooseObjectID([imageId])) {
        gfsImages.files.findOne({ "metadata.belongsTo": "default" }, function(err, file) {
            if (err || !file) { res.status(404).send("no image"); return; }
            res.header('Content-Length', file.length);
            res.header('Content-Type', file.contentType);

            gfsImages.createReadStream({
                _id: file._id
            }).pipe(res);
        });
    } else {
        // get file from gridfs
        gfsImages.files.findOne({ "metadata.imageId": ObjectId(imageId), "metadata.belongsTo": belongsTo }, function(err, file) {
            //  console.log(err,file,belongsTo)
            if (err || !file) {
                // return default image 
                gfsImages.files.findOne({ "metadata.belongsTo": "default" }, function(err, file) {
                    if (err || !file) { res.status(404).send("no image"); return; }
                    res.header('Content-Length', file.length);
                    res.header('Content-Type', file.contentType);

                    gfsImages.createReadStream({
                        _id: file._id
                    }).pipe(res);
                });
            } else {

                // send range response 
                const range = req.headers.range;
                if (range) {
                    console.log('range')
                    var parts = req.headers['range'].replace(/bytes=/, "").split("-");
                    var partialstart = parts[0];
                    var partialend = parts[1];

                    var start = parseInt(partialstart, 10);
                    var end = partialend ? parseInt(partialend, 10) : file.length - 1;
                    var chunksize = (end - start) + 1;
                    res.writeHead(206, {
                        'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': file.contentType
                    });
                    gfsImages.createReadStream({
                        _id: file._id,
                        range: {
                            startPos: start,
                            endPos: end
                        }
                    }).pipe(res);
                } else {
                    // if doesnt support range then send it sequential using pipe method in nodejs
                    res.header('Content-Length', file.length);
                    res.header('Content-Type', file.contentType);

                    gfsImages.createReadStream({
                        _id: file._id
                    }).pipe(res);
                }
            }
        })
    }
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})

// delete image 
router.delete('/images/delete/:image_id', checkAuth, limiter, async(req, res) => {
    try{
    const imageId = req.params.image_id;
    const userId = req.user._id;
    const belongsTo = req.query.belongs_to;
    const sourceId = req.query.source_id;
    if (!belongsTo || !sourceId) {
        res.status(400).send({ "error": "no source or belong_to where supplied" });
        return 0;
    }
    const deletedImage = await Image.deleteImage(imageId, userId, sourceId, belongsTo);
    if (!deletedImage) res.status(400).json({ "error": "image not deleted" });
    else res.status(200).json({ "success": "image deleted" })
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})

// get image id 
router.get('/images/get_id/:source_id', limiter, async(req, res) => {
    try{
    const sourceId = req.params.source_id;
    const belongsTo = req.query.belongs_to;
    const imageId = await Image.getImage(sourceId, belongsTo);
    if (!imageId) res.status(404).json({ "error": "cannot get image id" });
    else res.status(200).json({ "imageId": imageId });
}catch(ex){
    res.status(400).send({ "error": "error in making the request" });
}
})

module.exports = router;