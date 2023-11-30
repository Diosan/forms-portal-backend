import redis from 'redis';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';
import { redisClient, } from '../redis/redisConfig.js';


export class TOTPGenerator {
  constructor() {
    this.redisClient = redisClient;
    this.transporter = nodemailer.createTransport(mailConfig);
  }

  

  async generateOTP(jwttoken, email) {
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
      await this.sendOTPViaEmail(email, otp);
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
    // const savedKey = await redisClient.get(key);
    // console.log("Saved Key:",savedKey);
  }

  async sendOTPViaEmail(email, otp) {
    await this.transporter.sendMail({
      from: 'JSSWF <omm@link868.com>',
      to: email,
      subject: 'Your One-Time Password (OTP)',
      text: `Your OTP is: ${otp}`,
    });
  }

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
