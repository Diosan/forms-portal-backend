import redis from 'redis';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';
import { redisClient, } from '../redis/redisConfig.js';
// const { redisClient, redisURL, userChannel, redisAdapter, emitter } = require('../redis/redisConfig');


export default class SignOTPGenerator {
  constructor() {
    this.redisClient = redisClient;
    this.transporter = nodemailer.createTransport(mailConfig);
  }


  async generateOTP(submission_id, email, name) {
    console.log(email)
    // Generate a secure random number with no 3 consecutive digits
    let otp = '';
    for (let i = 0; i < 6; i++) {
      let nextDigit;
      do {
        nextDigit = crypto.randomInt(0, 10);
      } while (i >= 2 && otp[i - 1] === nextDigit && otp[i - 2] === nextDigit);
      otp += nextDigit;
    }
    console.log(otp);

    // Store OTP in Redis
    await this.storeOTPInRedis(email, otp);

    // Send OTP via email
    await this.sendOTPViaEmail(submission_id, email, name, otp);
  }

  async storeOTPInRedis(email, otp) {
    const key = `otp:${email}`;
    // await this.redisClient.set(key, 600, otp); // Expires in 180 seconds (3 minutes)
    await this.redisClient.set(key, otp);
  }

  async sendOTPViaEmail(submission_id, email, name, otp) {

    function getCurrentTimeInTrinidad() {
      const options = {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Port_of_Spain' // Time zone for Trinidad and Tobago
      };
  
      const trinidadTime = new Date().toLocaleTimeString('en-US', options);
      return trinidadTime; // Returns time in Trinidad and Tobago time zone
    }

    const currentTime = getCurrentTimeInTrinidad();
    const pathToImage = 'https://www.ttlawcourts.org/images/swf-logo.png';

    const htmlEmailString = `
    <!DOCTYPE html>
      <html>
      <head>
          <title>Verification Code</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  font-size:14px;
              }
              .container {
                  width: 80%;
                  margin: auto;
                  overflow: hidden;
              }
              .logo {
                  width: 100px;
                  height: 75px;
              }
              .code {
                  font-size: 30px;
                  color: #333;
                  letter-spacing:5px;
                  font-weight: bold;
              }
              .footer {
                  font-size: 12px;
                  color: #999;
              }
              .security-tip {
                  color: #ff0000;
              }

              .small-text {
                font-size: 10px;
            }

            .swf-text{
              font-size: 14px;
            }

            .swf-grey-bg{
              background-color:#eee;
              padding:20px;
              color:#222;
            }

            .swf-grey-red{
              background-color:#f8e6e0;
              padding:20px;
              color:#222;
              margin-top:10px; 
            }
            .swf-time{
              margin-top:10px; margin-bottom:30px
            }

          </style>
      </head>
      <body>
          <div class="container">
              <img src="${pathToImage}" alt="SWF Logo" class="logo"/>

              <p class="swf-text">Hi, <b>${name}</b></p>
              <p class="swf-text">It looks like you’re trying to sign a submission in SWF</p>
              <p class="swf-text">Your verification code is:</p>

              <p class="code">${otp}</p>              

              <p class="small-text swf-time">This verification code was generated at ${currentTime}</p>

              <div class="swf-grey-bg">
              <p>Do not share this verification code with a third party or other employee. We will NEVER ask you for this code.</p>

              </div>

              <p class="security-tip swf-grey-red "><b>Security Tip</b><br/>
              SWF will never send you unsolicited emails asking for confidential information, such as your Password, Verification Code, or User ID. 
              We will never ask you to validate or restore your account access through email or pop-up windows.</p>
              
          </div>
      </body>
      </html>`

    // await this.transporter.sendMail({
    //   from: 'JSSWF <omm@link868.com>',
    //   to: email,
    //   subject: 'Your One-Time Password (OTP)',
    //   html: htmlEmailString
    // });

    await this.transporter.sendMail({
      from: `SWF <${SWF_EMAIL}>`,
      to: email,
      subject: 'SWF -Your One-Time Password (OTP)',
      html: htmlEmailString,
    });

  }

  async verifyOTP(email, otp) {
    const key = `otp:${email}`;
    let stored_OTP = await this.redisClient.get(key);
    // console.log('Redis OTP Key: ' + key);
    console.log('OTP Values: ', { stored_OTP: stored_OTP, otp: otp })
    return stored_OTP == otp;
  }

}

// module.exports = SignOTPGenerator;
