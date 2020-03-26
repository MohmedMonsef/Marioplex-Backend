const  {user:userDocument,artist:artistDocument,album:albumDocument,track:trackDocument,playlist:playlistDocument,category:categoryDocument} = require('../models/db');


// initialize db 
const connection=require('../DBconnection/connection');
const User=require('./user-api');
const track=require('./track-api');

const Browse =  {
    
    
    getCategoryById  : async function(categoryID){
        
            // connect to db and find album with the same id then return it as json file
            // if found return album else return 0
            let category = await categoryDocument.findById(categoryID,(err,category)=>{
                if(err) return 0;
                return category;
            }).catch((err)=> 0);
            return category;
            

    },
    
    getCategoryies : async function(){
        
        // connect to db and find album with the same id then return it as json file
        // if found return album else return 0
        
        let category = await categoryDocument.find({},(err,category)=>{
            if(err) return 0;
            return category;
        }).catch((err)=> 0);
        return category;
        
        

       }
}
module.exports=Browse;