const ObjectId = require('mongoose').Types.ObjectId;
function checkMongooseID(ids){
    for(let id of ids){
        if(!ObjectId.isValid(id)) return 0;
    }
    return 1;
}

module.exports = checkMongooseID