var nodemailer = require('nodemailer');
module.exports = async function(email, message, type) {
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: String(process.env.SPOTIFY_EMAIL),
            pass: String(process.env.SPOTIFY_EMAIL_PASSWORD)
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var mailOptions;
    if (type == "password") {
        mailOptions = {
            from: '"Spotify Contact" <' + String(process.env.SPOTIFY_EMAIL) + '>',
            to: email,
            subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
            text: 'Please follow this URL http://100.25.194.8/login/reset_password?token=' + message

        };
    } else if (type == "confirm") {
        mailOptions = {
            from: '"Spotify Contact" <' + String(process.env.SPOTIFY_EMAIL) + '>',
            to: email,
            subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
            text: 'Please follow this URL http://100.25.194.8/confirm?id=' + message

        };
    }
    else if(type == "premium"){
        mailOptions = {
            from: '"Spotify Contact" <' + String(process.env.SPOTIFY_EMAIL) + '>',
            to: email,
            subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
            text: 'Please follow this URL http://100.25.194.8/premium/confirm?id=' + message

        };

    }
     else {
        mailOptions = {
            from: '"Spotify Contact" <' + String(process.env.SPOTIFY_EMAIL) + '>',
            to: email,
            subject: 'SPOTIFY SAMA has A Message FOR YOU ^^',
            text: message
        };
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error)
            if (email == String(process.env.SPOTIFY_EMAIL)) {
                // at frist send email to myself if not send correctly change the env variables
                console.log('your email is not correct which enter in env variables');
            }


    });
};