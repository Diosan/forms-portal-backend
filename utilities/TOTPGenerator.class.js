import redis from 'redis';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';
import { redisClient, } from '../redis/redisConfig.js';

const SWF_EMAIL = process.env.SWF_EMAIL || "";


export class TOTPGenerator {
  constructor() {
    this.redisClient = redisClient;
    this.transporter = nodemailer.createTransport(mailConfig);
  }

  

  async generateOTP(jwttoken, email, name) {
    //check if an OTP for this user already exists
    console.log(jwttoken, "----------", email);
    const key = `otp:${jwttoken}`; //should be jwttoken

    try {
      const storedOTP = await redisClient.get(key);
      if (storedOTP) {
          console.log("Stored OTP already exists: " + storedOTP);
          return; // Return early from the function if OTP exists
      } else {
          console.log("No OTP found for this user, generating a new one.");
      }
    } catch (error) {
        console.error("Error retrieving OTP from Redis:", error);
        return; // Also return from the function in case of an error
    }


    // Generate a secure random number with no 3 consecutive digits
    let otp = '';
    for (let i = 0; i < 6; i++) {
      let nextDigit;
      do {
        nextDigit = crypto.randomInt(0, 10);
      } while (i >= 2 && otp[i - 1] === nextDigit && otp[i - 2] === nextDigit);
      otp += nextDigit;
    }
    try {
      // Assuming storeOTPInRedis and sendOTPViaEmail are asynchronous functions
      console.log(otp)
      // Store OTP in Redis
      await this.storeOTPInRedis(jwttoken, otp);
      // Send OTP via email
      await this.sendOTPViaEmail(email, name, otp);
      // If both operations are successful
      console.log("OTP stored and sent successfully.");
    } catch (error) {
        // Handle errors that might occur during the OTP storage or email sending
        console.error("An error occurred:", error.message);
    }
  }

  async storeOTPInRedis(jwttoken, otp) {
    const key = `otp:${jwttoken}`;
    console.log("my key.........  ",key)
    await this.redisClient.set(key, otp, {
      EX: 180, // Expires in 180 seconds (3 minutes)
      NX: true
    }); 
    const storedOTP = await redisClient.get(key);
    const savedKey = await redisClient.get(key);
    console.log("Saved Key:",savedKey);
  }


  


  async sendOTPViaEmail(email, name, otp) {

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
  const pathToImage = 'https://www.ttlawcourts.org/images/swf-logo.png'
    


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

              <p class="swf-text">Hi, <b>${name}</b>!</p>
              <p class="swf-text">It looks like you’re signing in to SWF.</p>
              <p class="swf-text">Your verification code is:</p>

              <p class="code">${otp}</p>
              <p class="small-text swf-time">This verification code was generated at ${currentTime}</p>

              <div class="swf-grey-bg">
              <p>Do not share this verification code with a third party or other employee. We will NEVER ask you for this code.</p>
              <p>If you are having difficulty with this code, please try to log in again.</p>
              
              </div>
              
              <p class="footer">Please do not reply to this e-mail as it is sent from a notification only address and cannot accept incoming emails.</p>

              <p class="security-tip swf-grey-red "><b>Security Tip</b><br/>
              SWF will never send you unsolicited emails asking for confidential information, such as your Password, Verification Code, or User ID. 
              We will never ask you to validate or restore your account access through email or pop-up windows.</p>
          </div>
      </body>
      </html>
    
    `

    await this.transporter.sendMail({
      from: `SWF <${SWF_EMAIL}>`,
      to: email,
      subject: 'SWF Alerts',
      html: htmlEmailString,
    });
  }

  //Hi, Hilwyn!
// It looks like you’re signing in with a new computer.

// Your verification code is:

// 003553


// Here's the code
// you asked for
// 264357
// Don't share this code with anyone —
// we won't call to ask for it.
// If you didn't make this request,
// call us right away at 800.933.6262.

// We'll never ask for your personal information such as SSN or ATM PIN in email messages. If you get an email that looks suspicious, don't click on any hyperlinks. Instead, forward to abuse@bankofamerica.com then delete it.
// Please don't reply to this automatically generated service email.
// Privacy Notice	Equal Housing Lender 
// Bank of America, N.A. Member FDIC
// © 2023 Bank of America Corporation





  async verifyOTP(jwttoken, otp) {    //get token from user browser
    const key = `otp:${jwttoken}`;
    let stored_OTP = await redisClient.get(key);
    console.log('Redis OTP Key: ' + key);
    console.log('OTP Values: ', { stored_OTP: stored_OTP, otp: otp })
    return stored_OTP == otp;
  }

  // async  verifyOTP(jwttoken, otp) {
  //   let verified = await getStoredOTP(`${otp}:${jwttoken}`) 
  //   if (verified) {
  //     console.log(verified)
  //     return res.status(200).json({
  //       outcome: 'success',
  //     })
  //   } else {
  //     return res.status(200).json({
  //       outcome: 'error'
  //     })
  //   }
  // } 

  async getStoredOTP (theKey){
    console.log("get this key: ",theKey);
    const stored_OTP = await redisClient.get(theKey);
    console.log("the stored otp: ", stored_OTP)
    if(stored_OTP){
      return({status: "ok", code: stored_OTP})
    }else{
      return({status: "error"})
    }
  }

}

// module.exports = TOTPGenerator;
