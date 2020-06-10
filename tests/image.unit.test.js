const mockTrack = require('../source/track-api');
const mockUser = require('../source/user-api');
const mockArtist = require('../source/artist-api');
const mockAlbum = require('../source/album-api');
const mockImage = require('../source/image-api');
const mockPlaylist = require('../source/playlist-api')
const mongoose = require('mongoose');
const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const dbHandler = require('./db-handler');
const ObjectId = mongoose.Types.ObjectId;
const fs = require('fs')



let users = [{
      
        'displayName': 'dina alaa',
        'email': 'dinaalaaahmed@gmail.com',
        'password': '1223345677',
        'country': 'egypt',
        'isFacebook': false,
       
        'userType': 'user'
    }, {
        '_id': '2',
        'displayName': 'Arwa alaa',
        'email': 'Arwaalaaahmed@gmail.com',
        'password': '1223345678',
        'country': 'egypt',
        'isFacebook': true,
        'userType': 'user',
        'product':'premium',
        'premium':{}
        
    },
    {
        '_id': '3',
        'displayName': 'Alaa Alaa',
        'email': 'Arwalaaalaaahmed@gmail.com',
        'password': '12345678',
        'country': 'egypt',
        'userType': 'user',
        'isFacebook': true,
        
    }
]
let playlists = [];
let usersInDB = [];
let albums = [];
let artists = [];
let tracks = [];

let albumsObjs = [{
    '_id':'1',
    'artistId':'2',
    'hasTracks':[],
    'name':'album gamed',
    'images':[]

},
{
    '_id':'2',
    'artistId':'2',
    'hasTracks':[]

},
{
    '_id':'3',
    'artistId':'2',
    'hasTracks':[],
    'name':'ay haga1'

},
{
'_id':'4',
'artistId':'20',
'hasTracks':[],
'name':'ay haga'


},
{
  '_id':'5',
  'name':'haytham',
  'images':[],
  'hasTracks':[]
}]

let playlist;
beforeAll(async () => {
    await dbHandler.connect();
   // await new Promise((resolve)=>setTimeout(resolve,100));
    let i = 0;
    for(let user of users){
    let u = await mockUser.createUser(user.displayName,user.password,user.email,user.gender,user.country,user.birthDate);
    
    if(i == 1){
        u.product = 'premium'
        u.isFacebook = true;
        await u.save()
    }
    usersInDB.push(u);
    i++;
    }
     i=0;
    for(let user of usersInDB){
        if(i==1)break;
        playlist=await mockUser.createdPlaylist(user._id,'lili','hello kids');
        await mockUser.promoteToArtist(user._id,'artist info','artist'+i,['pop']);
        let artist =  await mockArtist.findMeAsArtist(user._id);
        artists.push(artist);
        i++;
        if(i==1){
            let j=0;
            for(let album of albumsObjs){
                let album1 = await mockArtist.addAlbum(artist._id,album.name,'label1',['eg'],'Single','1/1/2020','pop');
                albums.push(album1);
                if(j==0){
                    let track =   await mockTrack.createTrack('','track1',12,['eg'],artist._id,album1._id,100,'12','13',['pop']);
                    tracks.push(track);
                    await mockArtist.addTrack(artist._id, track._id);
                    await mockAlbum.addTrack(album1._id, track);
                } 
                j++;
            }
        }
    }
   
   
   
    
});
afterEach(async () => {
   // console.log('ddd')
    playlist = await playlistDocument.findById(playlist._id)
    await userDocument.find({},(err,files)=>{
        usersInDB = [];
        for(let user of files) usersInDB.push(user);
    })
    tracks = [];
    albums = [];
    artists = [];
    await artistDocument.find({},(err,files)=>{
        for(let file of files) artists.push(file)
    })
    await trackDocument.find({},(err,files)=>{
        for(let file of files) tracks.push(file)
    })
    await albumDocument.find({},(err,files)=>{
        for(let file of files) albums.push(file)
    })
    //await new Promise((resolve)=>setTimeout(resolve,100));
    
 });
afterAll(async () => {
    await dbHandler.clearDatabase();

     await dbHandler.closeDatabase();

 });

let image = {
    height:100,
    width:100,

}

 test('upload image for user',async (done)=>{
     const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,usersInDB[0]._id,'user',image) 
    // console.log(usersInDB[0].images)
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'user', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
    
   writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   //console.log('ddd')
    
   });

            
    
     
 })
 
 test('upload image for artist',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,artists[0]._id,'artist',image) 
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'artist', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
    
    writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
    
})
test('upload image for playlist',async (done)=>{
   // console.log(usersInDB[0],playlist)
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,playlist._id,'playlist',image)
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'playlist', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
    
    writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   }); 
    
})

test('upload image for track',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,tracks[0]._id,'track',image) 
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'track', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
    
    writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
   
})

test('upload image for album',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,albums[0]._id,'album',image) 
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'album', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
    
    writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
   
})

test('upload image for category',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,usersInDB[0]._id,'category',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})

test('upload image for non mongoose user',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage('1',usersInDB[0]._id,'user',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for non existing user',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(ObjectId(),usersInDB[0]._id,'user',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for user with no belongs to and no imaghe',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,usersInDB[0]._id) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for user with not same source id',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'user',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for playlist that is not authoeized for user',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[1]._id,playlist._id,'playlist',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for playlist not existing',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'playlist',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for track thats is unauthorized',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[1]._id,tracks[0]._id,'track',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for track that doesnt exist',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'track',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})

test('upload image for album thats is unauthorized',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[1]._id,albums[0]._id,'album',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for album that doesnt exist',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'album',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for artist thats is unauthorized',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[1]._id,artists[0]._id,'artist',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for album that doesnt exist',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'artist',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})
test('upload image for not entity',async (done)=>{
    const uploadedImageId = await mockImage.uploadImage(usersInDB[0]._id,ObjectId(),'none',image) 
    expect(uploadedImageId).toBeFalsy();
done();
})










test('update image for user',async (done)=>{
   // console.log(usersInDB[0])
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,usersInDB[0]._id,'user',image);
    let writestream = gfsImages.createWriteStream({
        filename: 'not_found',
        metadata: {userId: usersInDB[0]._id, belongsTo: 'user', imageId: uploadedImageId },
        content_type: 'image/jpeg',
        bucketName: 'images',
        root: 'images',
    });
    fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
    
    writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
})
test('update image for artist',async (done)=>{
    
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,artists[0]._id,'artist',image) 
   let writestream = gfsImages.createWriteStream({
    filename: 'not_found',
    metadata: {userId: usersInDB[0]._id, belongsTo: 'artist', imageId: uploadedImageId },
    content_type: 'image/jpeg',
    bucketName: 'images',
    root: 'images',
});
fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 

//await delay(5000)
   expect(uploadedImageId).toBeTruthy();
done();
})
test('update image for playlist',async (done)=>{
  // console.log(usersInDB[0],playlist)
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,playlist._id,'playlist',image) 
   let writestream = gfsImages.createWriteStream({
    filename: 'not_found',
    metadata: {userId: usersInDB[0]._id, belongsTo: 'playlist', imageId: uploadedImageId },
    content_type: 'image/jpeg',
    bucketName: 'images',
    root: 'images',
});
fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 

writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
//await delay(5000)
   expect(uploadedImageId).toBeTruthy();
done();
})

test('update image for track',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,tracks[0]._id,'track',image) 
   let writestream = gfsImages.createWriteStream({
    filename: 'not_found',
    metadata: {userId: usersInDB[0]._id, belongsTo: 'track', imageId: uploadedImageId },
    content_type: 'image/jpeg',
    bucketName: 'images',
    root: 'images',
});
fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 

writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
})

test('update image for album',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,albums[0]._id,'album',image) 
   let writestream = gfsImages.createWriteStream({
    filename: 'not_found',
    metadata: {userId: usersInDB[0]._id, belongsTo: 'album', imageId: uploadedImageId },
    content_type: 'image/jpeg',
    bucketName: 'images',
    root: 'images',
});
fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
//await delay(5000)
writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
})



test('update image for category',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,usersInDB[0]._id,'category',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})

test('update image for non mongoose user',async (done)=>{
   const uploadedImageId = await mockImage.updateImage('1',usersInDB[0]._id,'user',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for non existing user',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(ObjectId(),usersInDB[0]._id,'user',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for user with no belongs to and no imaghe',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,usersInDB[0]._id) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for user with not same source id',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'user',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for playlist that is not authoeized for user',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[1]._id,playlist._id,'playlist',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for playlist not existing',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'playlist',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for track thats is unauthorized',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[1]._id,tracks[0]._id,'track',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for track that doesnt exist',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'track',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})

test('update image for album thats is unauthorized',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[1]._id,albums[0]._id,'album',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for album that doesnt exist',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'album',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for artist thats is unauthorized',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[1]._id,artists[0]._id,'artist',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for album that doesnt exist',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'artist',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})
test('update image for not entity',async (done)=>{
   const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,ObjectId(),'none',image) 
   expect(uploadedImageId).toBeFalsy();
done();
})





test('get image for user',async (done)=>{
    
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    expect(imageId).toBeTruthy();
done();
})
test('get image for album',async (done)=>{
    const imageId = await mockImage.getImage(albums[0]._id,'album');
    expect(imageId).toBeTruthy();
done();
})
test('get image for track',async (done)=>{
    const imageId = await mockImage.getImage(tracks[0]._id,'track');
    expect(imageId).toBeTruthy();
done();
})
test('get image for artist',async (done)=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    expect(imageId).toBeTruthy();
done();
})
test('get image for album',async (done)=>{
    const imageId = await mockImage.getImage(playlist._id,'playlist');
    expect(imageId).toBeTruthy();
done();
})

test('get image for non mongoose user',async (done)=>{
    const imageId = await mockImage.getImage('1','user');
    expect(imageId).toBeFalsy();
done();
})
test('get image without belongs to',async (done)=>{
    const imageId = await mockImage.getImage(ObjectId());
    expect(imageId).toBeFalsy();
done();
})
test('get image for non existing user',async (done)=>{
    const imageId = await mockImage.getImage(ObjectId(),'user');
    expect(imageId).toBeFalsy();
done();
})
test('get image for non existing playlist',async (done)=>{
    const imageId = await mockImage.getImage(ObjectId(),'playlist');
    expect(imageId).toBeFalsy();
done();
})
test('get image for non existing album',async (done)=>{
    const imageId = await mockImage.getImage(ObjectId(),'album');
    expect(imageId).toBeFalsy();
done();
})
test('get image for non existing artist',async (done)=>{
    const imageId = await mockImage.getImage(ObjectId(),'artist');
    expect(imageId).toBeFalsy();
done();
})
test('get image for non existing track',async (done)=>{
    const imageId = await mockImage.getImage(ObjectId(),'track');
    expect(imageId).toBeFalsy();
done();
})
test('get image for non existing category',async (done)=>{
    const imageId = await mockImage.getImage(ObjectId(),'category');
    expect(imageId).toBeFalsy();
done();
})
test('get image for non existing entity',async (done)=>{
    const imageId = await mockImage.getImage(ObjectId(),'none');
    expect(imageId).toBeFalsy();
done();
})











// the image is deleted but returned 0 as it is not in grid fs but it does cover the seleted branch that's how i know it was deleted successfully
test('delete image for user',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    console.log(imageId)
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeTruthy();
done();
})

test('delete image for album',async (done)=>{
   // console.log(albums)
    const imageId = await mockImage.getImage(albums[0]._id,'album');
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,albums[0]._id,'album');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete image for playlist',async (done)=>{
    const imageId = await mockImage.getImage(playlist._id,'playlist');
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,playlist._id,'playlist');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete image for track',async (done)=>{
    const imageId = await mockImage.getImage(tracks[0]._id,'track');
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete non existing image for artist',async (done)=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for artist',async (done)=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImage(imageId,usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeTruthy();
done();
})

test('delete image for non mongoose id',async (done)=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImage(ObjectId(),'1',artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for with no belons to or source id',async (done)=>{
     const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
     const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id);
     expect(isDeleted).toBeFalsy();
done();
 })
 test('delete image for non existing user',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),ObjectId(),usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for user with no images',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for user unauthorized',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non existing playlist',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,ObjectId(),'playlist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non authorized playlist',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,playlist._id,'playlist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for playlist with no images',async (done)=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,playlist._id,'playlist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non existing track',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,ObjectId(),'track');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non authorized track',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for track with no images',async (done)=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non existing albums',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,ObjectId(),'album');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non authorized album',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,albums[0]._id,'album');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for track with no images',async (done)=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,albums[0]._id,'album');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non existing albums',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,ObjectId(),'artist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non authorized artist',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[1]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for artist with no images',async (done)=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for category',async (done)=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,artists[0]._id,'category');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non entity',async (done)=>{
    const isDeleted = await mockImage.deleteImage(ObjectId(),usersInDB[0]._id,artists[0]._id,'none');
    expect(isDeleted).toBeFalsy();
done();
})

// add back images to database



test('update image for user 1',async (done)=>{
    // console.log(usersInDB[0])
     const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,usersInDB[0]._id,'user',image);
     let writestream = gfsImages.createWriteStream({
         filename: 'not_found',
         metadata: {userId: usersInDB[0]._id, belongsTo: 'user', imageId: uploadedImageId },
         content_type: 'image/jpeg',
         bucketName: 'images',
         root: 'images',
     });
     fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
     
     writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
 })
 test('update image for artist 1',async (done)=>{
     
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,artists[0]._id,'artist',image) 
    let writestream = gfsImages.createWriteStream({
     filename: 'not_found',
     metadata: {userId: usersInDB[0]._id, belongsTo: 'artist', imageId: uploadedImageId },
     content_type: 'image/jpeg',
     bucketName: 'images',
     root: 'images',
 });
 fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
 
 writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
 })
 test('update image for playlist 1',async (done)=>{
   // console.log(usersInDB[0],playlist)
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,playlist._id,'playlist',image) 
    let writestream = gfsImages.createWriteStream({
     filename: 'not_found',
     metadata: {userId: usersInDB[0]._id, belongsTo: 'playlist', imageId: uploadedImageId },
     content_type: 'image/jpeg',
     bucketName: 'images',
     root: 'images',
 });
 fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
 
 writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
 })
 
 test('update image for track 1',async (done)=>{
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,tracks[0]._id,'track',image) 
    let writestream = gfsImages.createWriteStream({
     filename: 'not_found',
     metadata: {userId: usersInDB[0]._id, belongsTo: 'track', imageId: uploadedImageId },
     content_type: 'image/jpeg',
     bucketName: 'images',
     root: 'images',
 });
 fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
 
 writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
 })
 
 test('update image for album 1',async (done)=>{
    const uploadedImageId = await mockImage.updateImage(usersInDB[0]._id,albums[0]._id,'album',image) 
    let writestream = gfsImages.createWriteStream({
     filename: 'not_found',
     metadata: {userId: usersInDB[0]._id, belongsTo: 'album', imageId: uploadedImageId },
     content_type: 'image/jpeg',
     bucketName: 'images',
     root: 'images',
 });
 fs.createReadStream('./static/not_found.jpeg').pipe(writestream); 
 //await delay(5000)
 writestream.on('close', async (file)=>{
    expect(uploadedImageId).toBeTruthy();
done();
   
    
   });
 })
 










// the image is deleted but returned 0 as it is not in grid fs but it does cover the seleted branch that's how i know it was deleted successfully
test('delete images for user',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for album',async (done)=>{
    const imageId = await mockImage.getImage(albums[0]._id,'album');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,albums[0]._id,'album');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for playlist',async (done)=>{
    const imageId = await mockImage.getImage(playlist._id,'playlist');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,playlist._id,'playlist');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for track',async (done)=>{
    const imageId = await mockImage.getImage(tracks[0]._id,'track');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete non existing images for artist',async (done)=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for artist',async (done)=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeTruthy();
done();
})

test('delete images for non mongoose id',async (done)=>{
    const imageId = await mockImage.getImage(artists[0]._id,'artist');
    const isDeleted = await mockImage.deleteImages('1',artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for with no belons to or source id',async (done)=>{
     const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
     const isDeleted = await mockImage.deleteImages(usersInDB[0]._id);
     expect(isDeleted).toBeFalsy();
done();
 })
 test('delete images for non existing user',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(ObjectId(),usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for user with no images',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for user unauthorized',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,usersInDB[0]._id,'user');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete image for non existing playlist',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,ObjectId(),'playlist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for non authorized playlist',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,playlist._id,'playlist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for playlist with no images',async (done)=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,playlist._id,'playlist');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for non existing track',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,ObjectId(),'track');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for non authorized track',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for track with no images',async (done)=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,tracks[0]._id,'track');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for non existing albums',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,ObjectId(),'album');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for non authorized album',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,albums[0]._id,'album');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for track with no images',async (done)=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,albums[0]._id,'album');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for non existing albums',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,ObjectId(),'artist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for non authorized artist',async (done)=>{
    const imageId = await mockImage.getImage(usersInDB[0]._id,'user');
    const isDeleted = await mockImage.deleteImages(usersInDB[1]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for artist with no images',async (done)=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'artist');
    expect(isDeleted).toBeTruthy();
done();
})
test('delete images for category',async (done)=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'category');
    expect(isDeleted).toBeFalsy();
done();
})
test('delete images for non entity',async (done)=>{
    const isDeleted = await mockImage.deleteImages(usersInDB[0]._id,artists[0]._id,'none');
    expect(isDeleted).toBeFalsy();
done();
})
