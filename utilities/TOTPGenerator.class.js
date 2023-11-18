const redis = require('redis');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail.config');
const { redisClient, redisURL, userChannel, redisAdapter, emitter } = require('../redis/redisConfig');


class TOTPGenerator {
  constructor() {
    this.redisClient = redisClient;
    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async generateOTP(email) {
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
    await this.redisClient.set(key, 180, otp); // Expires in 180 seconds (3 minutes)
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
    stored_OTP = await thisRedisClient.set('otp:' + email);
    return stored_OTP == otp;
  }

}

module.exports = TOTPGenerator;
