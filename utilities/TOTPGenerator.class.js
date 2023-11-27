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

  async generateOTP(sessionId, email) {
    //check if an OTP for this session already exists
    console.log(sessionId), "", email;
    const key = `otp:${sessionId}`;

    try {
      const storedOTP = await redisClient.get(key);
      if (storedOTP) {
          console.log("Stored OTP already exists: " + storedOTP);
          return; // Return early from the function if OTP exists
      } else {
          console.log("No OTP found for this session, generating a new one.");
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
      // Store OTP in Redis
      await this.storeOTPInRedis(sessionId, otp);
      // Send OTP via email
      await this.sendOTPViaEmail(email, otp);
      // If both operations are successful
      console.log("OTP stored and sent successfully.");
    } catch (error) {
        // Handle errors that might occur during the OTP storage or email sending
        console.error("An error occurred:", error.message);
    }
  }

  async storeOTPInRedis(sessionId, otp) {
    const key = `otp:${sessionId}`;
    // console.log(key, otp)
    await this.redisClient.set(key, otp, {
      EX: 180, // Expires in 180 seconds (3 minutes)
      NX: true
    }); 
    const savedKey = await this.redisClient.get(key);
    console.log("Saved Key:",savedKey);
  }

  async sendOTPViaEmail(email, otp) {
    await this.transporter.sendMail({
      from: 'JSSWF <omm@link868.com>',
      to: email,
      subject: 'Your One-Time Password (OTP)',
      text: `Your OTP is: ${otp}`,
    });
  }

  async verifyOTP(email, otp) {
    const key = `otp:${email}`;
    let stored_OTP = await this.redisClient.get(key);
    console.log('Redis OTP Key: ' + key);
    console.log('OTP Values: ', { stored_OTP: stored_OTP, otp: otp })
    return stored_OTP == otp;
  }

}

// module.exports = TOTPGenerator;
