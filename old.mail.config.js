import dotenv from 'dotenv';
dotenv.config();

export const mailConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
}

// export const mailConfig = {
  //  host: "10.0.1.7",  
  //  port: 25,           // Replace with the port number
  //  secure: false,                  // True for 465, false for other ports
    // auth: {
     //  user: "swf-noreply@ttlawcourts.org",           // If authentication is required, replace with your username
      // pass: "strawberries123"            // If authentication is required, replace with your password
    //},
  //  tls: {
        // Do not fail on invalid certs (if you are using self-signed certificates)
  //      rejectUnauthorized: false
  //  },
  //  debug: true,
  //  logger: false,
//};

