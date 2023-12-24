
const nodemailer = require('nodemailer')

exports.generateOTP = () => {
    const digits = '0123456789';
    let otp = ''
    for (let i = 0; i <= 3; i++){
        const randVal = Math.round(Math.random() * 9)
        otp = otp + randVal
    }
    return otp;
}

exports.mailTransport = () => nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD
    }
});
  
exports.generateEmailTemplate = code => {
    return `
    <!DOCTYPE html>
    <html lang ='en'>
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>
    @media only screen and (max-width: 620px){
        h1{font-size: 20px;
        padding: 5px;
    }
    }
    </style>
    </head>
    </body>
    <div>
    <div style="max-width: 620px; margin: 0 auto; font-family:
    sans-serif; color: #272727;">
    <h1 style="background: #f6f6f6; padding: 10px; text-align: center; color: #272727;">
    We Are Happy to See you In Our Team!</h1>
    <p>Please Verify your Email To Continue Your Verification code is:</p>
    <p style="width: 80px; margin: 0 auto; font-weight: bold;
    text-align: center; background: #f6f6f6; border-radius: 5px;
    font-size: 25px;">${code}</p>
    </div>
    </div>
    </body>
    </html>
    `;
};

exports.plainEmailTemplate = (heading, message) => {
    return `
    <!DOCTYPE html>
    <html lang ='en'>
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>
    @media only screen and (max-width: 620px){
        h1{font-size: 20px;
        padding: 5px;
    }
    }
    </style>
    </head>
    </body>
    <div>
    <div style="max-width: 620px; margin: 0 auto; font-family:
    sans-serif; color: #272727;">
    <h1 style="background: #f6f6f6; padding: 10px; text-align: center; color: #272727;">
    ${heading}</h1>
    
    <p style="width: 80px; margin: 0 auto; font-weight: bold;
    text-align: center; background: #f6f6f6; border-radius: 5px;
    font-size: 25px;">${message}</p>
    </div>
    </div>
    </body>
    </html>
    `;
};

exports.generatePasswordResetTemplate = url => {
    return `
    <!DOCTYPE html>
    <html lang ='en'>
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>
    @media only screen and (max-width: 620px){
        h1{font-size: 20px;
        padding: 5px;
    }
    }
    </style>
    </head>
    </body>
    <div>
    <div style="max-width: 620px; margin: 0 auto; font-family:
    sans-serif; color: #272727;">
    <h1 style="background: #f6f6f6; padding: 10px; text-align: center; color: #272727;">
    Response to your reset password Request</h1>
    <p style="width: 80px; margin: 0 auto; font-weight: bold;
    text-align: center; background: #f6f6f6; border-radius: 5px;
    font-size: 25px;">click here to reset password</p>
    <a href= "${url}" style="font-family: sans-serif;
    margin: 0auto; padding: 20px; text-align: center;
    background: #e63946; border-radius: 5px; font-size:
    20px 10px; color: #fff; cursor: pointer;
    text-decoration: none; display: inline-block;
    ">Reset Passowrd</a>
    
    </div>
    </div>
    </body>
    </html>
    `;
};