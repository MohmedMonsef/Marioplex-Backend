module.exports = {
    facebook:{ 
        // facebook app secret keys 
        // can be implemented in environment variable later
        FACEBOOK_APP_ID:process.env.FACEBOOK_APP_ID,
        FACEBOOK_APP_SECRET:process.env.FACEBOOK_APP_SECRET
    },
    googleDrive:{
        token:{"access_token":process.env.google_drive_access_token,
    "refresh_token":process.env.google_drive_refresh_token,
    "scope":process.env.google_drive_scope,
    "token_type":"Bearer",
    "expiry_date":1588394642436}
        ,
        credentials:{ "installed": { "client_id":process.env.google_drive_client_id,
         "project_id":process.env.google_drive_project_id,
          "auth_uri": "https://accounts.google.com/o/oauth2/auth",
           "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": process.env.google_drive_client_secret, "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"] } }
    }
    
    
}