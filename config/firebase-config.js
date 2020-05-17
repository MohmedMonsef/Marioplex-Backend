path=require('path');
module.exports=function(){
   let reqpath =path.join(__dirname, '../service-account.json');
    process.env.GOOGLE_APPLICATION_CREDENTIALS=reqpath;
};