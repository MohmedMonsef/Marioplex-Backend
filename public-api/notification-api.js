const { user: userDocument, artist: artistDocument, album: albumDocument, track: trackDocument, playlist: playlistDocument, category: categoryDocument } = require('../models/db');

const checkMonooseObjectID = require('../validation/mongoose-objectid')
var admin = require('firebase-admin');
admin.initializeApp()
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

        //get the fcm token of the profile user
        let token=profileUser.fcmToken;
        //notification body
        let curName=currentUser.displayName;
        //create the notification object
       let notificationMessage={
        notification: {
            title: "Knock , Knock ! Who's There ?",
            body: "It's "+curName+" who viewed Your Profile"
            }
            ,
            data: {
            userId: String(currentUser._id)
          }
        };
        //flag to check succes or not
        let checkFailed;
        //check online or offline
        if(token!="none"){
            //if online
            //create the mesaage object
            var message = {
                notification:notificationMessage.notification,
                data:notificationMessage.data,
                tokens: [token]
               };
            //then send the notification object to the profile user (token)
            checkFailed=await this.sendNotification([token],message); 
            console.log(checkFailed);
            console.log(message);

        }
       if(token=="none"||checkFailed.length>0){
        if(!profileUser.offlineProfileNotification)profileUser.offlineProfileNotification=[];
        profileUser.offlineProfileNotification.push(notificationMessage);
        await profileUser.save();
        return 0;
       }
       return 1;

    },

       //the user profile notification
    sendOfflineProfileNotification:async function(OfflineMessages,profileUser) {
     let messages=[];
     for(var i=0;i<OfflineMessages.length;i++){
        messages.push({
            notification:OfflineMessages[i].notification,
            data:OfflineMessages[i].data,
            token:profileUser.fcmToken
         })
     }
  
        //send the notification object to the profile user (token)
        await this.sendManyNotifications(messages);      
        profileUser.offlineProfileNotification=[];
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

  

}
module.exports = Notifications;