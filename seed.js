const localhost = 'mongodb://localhost:27017/test';
const mlab = "bahaa:123456b@ds157834.mlab.com:57834/spotify-demo";
//String(process.env.CONNECTION_STRING)
module.exports = {
    "undefined": localhost,
    "dev": "localhost/DEV_DB_NAME",
    "prod": "localhost/PROD_DB_NAME"
}