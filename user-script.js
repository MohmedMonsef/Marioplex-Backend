const request = require('request-promise');
const fs = require('fs');
const password = "12345678";
const emails = [
    "dai.a.elrihany@gmail.com",
    "dinaalaaahmed@gmail.com",
    "nada5aled52@gmail.com",
    "nihalmansour0599@gmail.com",
    "hager.aismail@gmail.com",
    "menna123mahmoud@gmail.com",
    "ayasabohadima@gmail.com",
    'nerdeen.ahmad15@gmail.com',
    'lenaa.sayed7@gmail.com',
    'bassantmohamed945@yahoo.com',
    "omar.abdelfatah.h@gmail.com",
    "kareem.mohamed9711@gmail.com",
    "mohmedmonsef70@gmail.com",
    "tarek.saad99@eng-st.cu.edu.eg",
    'abdofdl99@gmail.com',
    'bahaaeldeen1999@gmail.com',
    'belalelhossany12@gmail.com',
    'mohamedsherifwagdy@hotmail.com'

];
const gender = ['female', 'male'];
const country = 'eg';
const birthday = ['1999-09-04', '1999-09-04', '1999-01-04', '1999-09-04', '1999-09-04', '1999-09-04', '2000-02-20', '1999-09-04', '1999-09-04', '1999-07-04', '1999-04-04', '1999-01-04', '1999-06-04', '1999-12-03', '1999-11-03', '1999-06-07', '1999-10-04', '1999-09-07'];
const username = ['Dai', 'Dina', 'Nada', 'Nihal', 'Hager', 'Menna', 'Aya', 'Nerdeen', 'Asmaa', 'Bassant', 'Omar', 'Kareem', 'Mohmed', 'Tarek', 'Abdel Rahman', 'Bahaa', 'Belal', 'Mohamed'];
main();
async function main() {
    console.log(emails.length)
    for (let i = 0; i < emails.length; i++) {
        var options = {
            'method': 'POST',
            'url': 'http://localhost:3000/api/sign_up',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "email": emails[i], "password": password, 'gender': i < 10 ? gender[0] : gender[1], 'country': country, 'birthday': birthday[i], 'username': username[i] })

        };
        console.log(options.body);
        await request(options, function(error, response) {
            if (error) return 0;

        });
        // console.log(token);

        await delay(9000);

    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}