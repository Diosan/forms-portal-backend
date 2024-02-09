import { UserModel } from '../models/index.js';
import { redisClient, } from '../redis/redisConfig.js';
import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';
import { generate } from 'generate-passphrase';
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';
dotenv.config()

const SWF_EMAIL = process.env.SWF_EMAIL

export class passPhrases {

    constructor() {
      this.redisClient = redisClient;
      this.transporter = nodemailer.createTransport(mailConfig);
    }

    async generatePassphrase(email) {
        const passphrase = generate({ length: 12, separator: ', ', numbers: false, titlecase: true });
        const phraseHash = createHash('sha3-256').update(passphrase).digest('hex');

        console.log('\n\n\n  pass phrase email: ' + email + ' \n\n\n');

        let user = await UserModel.findOne({
            where: { email: email }
        });

        if(user) {
            console.log('\n\n\n User returned from database for email ' + email + ': ', user);
            console.log('\n\n\n');
            let updated_user = await user.update(
                {passPhrase: phraseHash},
                {where: { email: email}}            
            )
        } else {
            console.log('\n\n\n Unable to get user from database with email ' + email + ' \n\n\n');
        }


        await this.sendOTPViaEmail(user, passphrase);

        // return { hash: phraseHash }
    }

    async sendOTPViaEmail(user, pass_phrase) {

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
        const name = user.firstName;
    
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
                      font-size: 15px;
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
                  <img src="${pathToImage}" alt="SWIF Logo" class="logo"/>
    
                  <p class="swf-text">Hi, <b>${name}</b></p>
                  <p class="swf-text">We have generated an emergency pass phrase for your use in SwiF should email functionality become unavilable</p>
                  <p class="swf-text">Your pass phrase is:</p>
    
                  <p class="code">"${pass_phrase}"</p>              
    
                  <p class="small-text swf-time">This pass phrase was generated at ${currentTime}</p>
    
                  <div class="swf-grey-bg">
                  <p>Do not share this pass phrase with a third party or other employee. We will NEVER ask you for this code.</p>
    
                  </div>
    
                  <p class="security-tip swf-grey-red "><b>Security Tip</b><br/>
                  SWIF will never send you unsolicited emails asking for confidential information, such as your Password, Verification Code, or User ID. 
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
          from: `SWIF <${SWF_EMAIL}>`,
          to: user.dataValues.email,
          subject: `SWIF - Your emergency pass phrase`,
          html: htmlEmailString,
        });

    }

    async verifyPassphrase(complainant_email, pass_phrase) {

        await console.log('\n\n\ncomplainant_email: ' + complainant_email)
        await console.log('pass_phrase: ' + pass_phrase + ' \n\n\n\n')
        let user = await UserModel.findOne({
            where: { email: complainant_email },
            raw: true
        });
        await console.log('\n\n\n User for passPhrase verification: ', user);
        await console.log('\n\n\n passPhrase SHA hash: ',  createHash('sha3-256').update(pass_phrase).digest('hex'));

        return user.passPhrase == createHash('sha3-256').update(pass_phrase).digest('hex');
    }

}
