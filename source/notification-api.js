const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');
const checkMonooseObjectID = require('../validation/mongoose-objectid')
var admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert({
        type:process.env.type,
        project_id:process.env.project_id,
        private_key_id:process.env.private_key_id,
        private_key:process.env.private_key.replace(/\\n/g, '\n'),
        client_email:process.env.client_email,
        client_id:process.env.client_id,
        auth_uri: process.env.auth_uri,
        token_uri: process.env.token_uri,
        auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
        client_x509_cert_url:process.env.client_x509_cert_url
    })
});


const Notifications = {
  //send one notification to many users
  sendNotification: async function(registrationTokens,message) {

    const failedTokens = [];
    admin.messaging().sendMulticast(message)
    .then((response) => {
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
      }
      else{
          console.log("Message has been sent successfully")
      }
    });

  return failedTokens;
},
    //the user profile notification
    sendProfileNotification:async function(currentUser,profileUser) {
        if(!profileUser.fcmToken)
        {
            profileUser.fcmToken="none"; 
            await profileUser.save();
        }
        //get the fcm token of the profile user
        let token=profileUser.fcmToken;
        //notification body
        let curName=currentUser.displayName;
        //create the notification object
       let notificationMessage={
            data: {
            userId: String(currentUser._id),
            title: "Knock , Knock ! Who's There ?",
            body: "It's "+curName+" who viewed Your Profile"
          }
        };
        //flag to check succes or not
        let checkFailed;
        //check online or offline
        if(token!="none"){
            //if online
            //create the mesaage object
            var message = {
                data:notificationMessage.data,
                tokens: [token]
               };
            //then send the notification object to the profile user (token)
            try{
            checkFailed=await this.sendNotification([token],message); 
            }
            catch(err){
                console.log("cant send message now");
            }
            console.log(checkFailed);
            console.log(message);

        }
       if(token=="none"||checkFailed.length>0){
        if(!profileUser.offlineNotifications)profileUser.offlineNotifications=[];
        profileUser.offlineNotifications.push(notificationMessage);
        await profileUser.save();
        return 0;
       }
       if(!profileUser.notifications)profileUser.notifications=[];
        profileUser.notifications.push(notificationMessage);
        await profileUser.save();
       return 1;

    },
    //send the user profile notification
    sendOfflineNotifications:async function(OfflineMessages,profileUser) {
     let messages=[];
     for(var i=0;i<OfflineMessages.length;i++){
        messages.push({
            data:OfflineMessages[i].data,
            token:profileUser.fcmToken
         })
     }
  
        //send the notification object to the profile user (token)
        try{
            await this.sendManyNotifications(messages); 
        }
            catch(err){
                console.log("cant send message now");
                return;
        }     
        profileUser.offlineNotifications=[];
        await profileUser.save();
        return 1;

    },
    //send many notifications to one user
     sendManyNotifications: async function(messages) {
        console.log(messages)
        admin.messaging().sendAll(messages)
        .then((response) => {
          console.log(response.successCount + ' messages were sent successfully');
        });
  },
    //the user following Artist notification
    sendArtistNotification:async function(artist,track) {
        let users;
        let tokens=[];
        
       users= await userDocument.find({});
        if(users==undefined)return;
        //create Notification object
        let notificationMessage={
                data: {
                artistId: String(artist._id),
                trackId:String(track._id),
                title: "WOOOOOH NEW SONG",
                body: artist.Name+" Uploaded a New Song -- CHECK IT OUT !"
            }
            };
        for(var i=0;i<users.length;i++){
            for(var j=0;j<users[i].follow.length;j++){
                if(String(users[i].follow[j].id)==String(artist._id)){
                    if(!users[i].fcmToken){users[i].fcmToken="none";
                      await users[i].save();}
                    if(users[i].fcmToken!="none"){
                        tokens.push(users[i].fcmToken);
                    }
                    else{
                        if(!users[i].offlineNotifications)users[i].offlineNotifications=[];
                        users[i].offlineNotifications.push(notificationMessage);
                        await users[i].save();
                    }
                    if(!users[i].notifications)users[i].notifications=[];
                    users[i].notifications.push(notificationMessage);
                    await users[i].save();
                }
            }
        }
        if(tokens.length!=0){
            //if online
            //create the mesaages object
            var messages = {
                data:notificationMessage.data,
                tokens: tokens
            };
            //then send the notification object to the followers
            try{
                checkFailed=await this.sendNotification(tokens,messages); 
            }
                catch(err){
                    console.log("cant send message now");
            }  
            console.log(checkFailed);
            console.log(messages);

        }
    return 1;

    },
    sendArtistAlbumNotification:async function(artist,album) {
      let users;
      let tokens=[];
      
      users=await userDocument.find({});
      if(users==undefined)return;
      //create Notification object
      let notificationMessage={
              data: {
              artistId: String(artist._id),
              albumId:String(album._id),
              title: "WOOOOOH NEW ALBUM",
              body: artist.Name+" Uploaded a New Album -- CHECK IT OUT !"
          }
          };
      for(var i=0;i<users.length;i++){
          for(var j=0;j<users[i].follow.length;j++){
              if(String(users[i].follow[j].id)==String(artist._id)){
                  if(!users[i].fcmToken){users[i].fcmToken="none";
                    await users[i].save();}
                  if(users[i].fcmToken!="none"){
                      tokens.push(users[i].fcmToken);
                  }
                  else{
                      if(!users[i].offlineNotifications)users[i].offlineNotifications=[];
                      users[i].offlineNotifications.push(notificationMessage);
                      await users[i].save();
                  }
                  if(!users[i].notifications)users[i].notifications=[];
                  users[i].notifications.push(notificationMessage);
                  await users[i].save();
              }
          }
      }
      if(tokens.length!=0){
          //if online
          //create the mesaages object
          var messages = {
              data:notificationMessage.data,
              tokens: tokens
          };
          //then send the notification object to the followers
          try{
            checkFailed=await this.sendNotification(tokens,messages); 
        }
            catch(err){
                console.log("cant send message now");
        }  
          console.log(checkFailed);
          console.log(messages);

      }
  return 1;

  },
  sendPlaylistNotification:async function(currentUser,profileUser,playlist) {
    if(!profileUser.fcmToken)
    {
        profileUser.fcmToken="none"; 
        await profileUser.save();
    }
    //get the fcm token of the profile user
    let token=profileUser.fcmToken;
    //notification body
    let curName=currentUser.displayName;
    //create the notification object
   let notificationMessage={
        data: {
        userId: String(currentUser._id),
        title: " You seem to have a good musical taste ",
        body: curName+" followed Your "+playlist.name+" Playlist"
      }
    };
    //flag to check succes or not
    let checkFailed;
    //check online or offline
    if(token!="none"){
        //if online
        //create the mesaage object
        var message = {
            data:notificationMessage.data,
            tokens: [token]
           };
        //then send the notification object to the profile user (token)
        try{
            checkFailed=await this.sendNotification([token],message); 
        }
            catch(err){
                console.log("cant send message now");
        }  
        console.log(checkFailed);
        console.log(message);

    }
   if(token=="none"||checkFailed.length>0){
    if(!profileUser.offlineNotifications)profileUser.offlineNotifications=[];
    profileUser.offlineNotifications.push(notificationMessage);
    await profileUser.save();
    return 0;
   }
   if(!profileUser.notifications)profileUser.notifications=[];
   profileUser.notifications.push(notificationMessage);
   await profileUser.save();
   return 1;

}

}
module.exports = Notifications;