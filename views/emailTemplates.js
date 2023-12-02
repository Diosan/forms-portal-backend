const pathToImage = 'https://www.ttlawcourts.org/images/swf-logo.png'

export const passWordResetEmailString = `
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
              <p class="swf-text">It looks like you’re trying to change your password.</p>

              <p class="small-text swf-time">Click this link to begin the password reset process:  ${passwordResetChange}</p>

              <div class="swf-grey-bg">
                <p>Do not share this link with a third party or other employee.</p>              
              </div>
              
              <p class="footer">Please do not reply to this e-mail as it is sent from a notification only address and cannot accept incoming emails.</p>

              <p class="security-tip swf-grey-red "><b>Security Tip</b><br/>
              SWF will never send you unsolicited emails asking for confidential information, such as your Password, Verification Code, or User ID. 
              We will never ask you to validate or restore your account access through email or pop-up windows.</p>
          </div>
      </body>
      </html>
    `