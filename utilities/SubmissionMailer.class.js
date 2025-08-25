import redis from 'redis';
import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';
import { redisClient, } from '../redis/redisConfig.js';
import 'dotenv/config';

export class SubmissionMailer {

    constructor() {
        this.redisClient = redisClient;
        this.transporter = nodemailer.createTransport(mailConfig);
    }

    async signatureRequestEmail(submission_id, email, name) {

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
                  <p class="swf-text">Your signature has been requested for verification on a submission in SWF</p>

                  <p class="swf-text">Click <a href="${process.env.APP_DOMAIN + '/sign/' + submission_id}">here</a> to verify submission</p>  
              
    
                  <p class="small-text swf-time">This verification request was generated at ${currentTime}</p>
    
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
        //     from: 'JSSWF <omm@link868.com>',
        //     to: email,
        //     subject: 'SWiF submission verification request',
        //     html: htmlEmailString
        // });

        await this.transporter.sendMail({
            from: `SWF <${SWF_EMAIL}>`,
            to: email,
            subject: 'SWiF submission verification request',
            html: htmlEmailString,
          });

    }


}
