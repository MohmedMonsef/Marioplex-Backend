var nodemailer = require('nodemailer');
module.exports = async function(email, message, type) {
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: String(process.env.SPOTIFY_EMAIL) ? String(process.env.SPOTIFY_EMAIL) : 'appspotify646@gmail.com',
            pass: String(process.env.SPOTIFY_EMAIL_PASSWORD) && String(process.env.SPOTIFY_EMAIL) ? String(process.env.SPOTIFY_EMAIL_PASSWORD) : 'Helloworld55'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var mailOptions;
    if (type == "password") {
        mailOptions = {
            from: '"Spotify Contact" <' + process.env.SPOTIFY_EMAIL ? String(process.env.SPOTIFY_EMAIL) : 'appspotify646@gmail.com' + '>',
            to: email,
            subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
            text: 'Please follow this URL http://52.205.254.29/login/reset_password?token=' + message

        };
    } 
    else if(type=="confirm"){
        mailOptions = {
            from: '"Spotify Contact" <' + process.env.SPOTIFY_EMAIL ? String(process.env.SPOTIFY_EMAIL) : 'appspotify646@gmail.com' + '>',
            to: email,
            subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
            text: 'Please follow this URL http://52.205.254.29/login/confirm?id=' + message

        };
    }
    else {
        mailOptions = {
            from: '"Spotify Contact" <' + process.env.SPOTIFY_EMAIL ? String(process.env.SPOTIFY_EMAIL) : 'appspotify646@gmail.com' + '>',
            to: email,
            subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
            text: message
        };
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error)
            if (email == String(process.env.SPOTIFY_EMAIL)) {
                // at frist send email to myself if not send correctly change the env variables
                console.log('your email is not correct which enter in env variables so that we will use our email  ');
                process.env['SPOTIFY_EMAIL'] = 'appspotify646@gmail.com';
                process.env['process.env.SPOTIFY_EMAIL_PASSWORD'] = 'Helloworld55';
            }


    });
};