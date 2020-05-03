const { google } = require('googleapis');
const token = require('../authentication/keys').googleDrive.token;
const credentials = require('../authentication/keys').googleDrive.credentials;
global.drive = undefined;
global.auth = undefined;

// setup google drive authentication
module.exports = function(){
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    auth.setCredentials(token);
     drive = google.drive({ version: 'v3',auth });

     
}