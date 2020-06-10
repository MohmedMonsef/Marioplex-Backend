const localhost = 'mongodb://localhost:27017/test';
//String(process.env.CONNECTION_STRING)
module.exports = {
    "undefined": localhost,
    "dev": "localhost/DEV_DB_NAME",
    "prod": "localhost/PROD_DB_NAME"
}