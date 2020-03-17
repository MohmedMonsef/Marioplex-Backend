const middleTrack = "2";

const router = require('express').Router();


const Player =require('../public-api/player-api');
const User = require('../public-api/user-api');
const {auth:checkAuth} = require('../middlewares/isMe');

router.get('/updatePlayer/:id',async (req,res)=>{
    const user = await User.getUserById("5e6bcfec15da8934bc2114d5")
  const p =  await Player.setPlayerInstance(user,true,"5e713e741103df39508b20cf",req.params.id);
  if(!p) res.status(404).send({error:"wrong"});
  else res.json({"success":"updated user player"});
})

module.exports = router;