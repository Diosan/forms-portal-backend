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

  async generateOTP(email, name) {
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
    await this.sendOTPViaEmail(email, otp);
  }

  async storeOTPInRedis(email, otp) {
    const key = `otp:${email}`;
    // await this.redisClient.set(key, 600, otp); // Expires in 180 seconds (3 minutes)
    await this.redisClient.set(key, otp);
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

// module.exports = SignOTPGenerator;
