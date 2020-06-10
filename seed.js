const localhost = 'mongodb://localhost:27017/test';
module.exports = {
    "undefined": String(process.env.CONNECTION_STRING),
    "dev": "localhost/DEV_DB_NAME",
    "prod": "localhost/PROD_DB_NAME"
}