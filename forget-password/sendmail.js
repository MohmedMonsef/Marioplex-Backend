var nodemailer = require('nodemailer');
module.exports=async function(email,message,type){
var transporter = nodemailer.createTransport({
  host:'smtp.gmail.com',
  port:587,
  secure:false,
  auth: {
    user: 'appspotify646@gmail.com',
    pass: 'Helloworld55'
  },
  tls:{
    rejectUnauthorized:false
  }
});
var mailOptions;
if(type=="password"){
 mailOptions = {
  from: '"Spotify Contact" <appspotify646@gmail.com>',
  to: email,
  subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
  text:'Please follow this URL http://52.205.254.29/login/reset_password?token=' + message
  
};
}
else{
  mailOptions = {
    from: '"Spotify Contact" <appspotify646@gmail.com>',
    to: email,
    subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
    text:message
  };
}

transporter.sendMail(mailOptions, function(error, info){
 
});
};