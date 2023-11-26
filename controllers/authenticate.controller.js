import {db} from "../models/index.js";
import dotenv from 'dotenv'
dotenv.config();
const AccessLog = db.accesslogs;
import formidable  from 'formidable'
const User = db.users;
const Permission = db.permissions;
const Op = db.Sequelize.Op;
import winston from 'winston' 
import jwt from 'jsonwebtoken' 
import bcrypt from 'bcrypt' 
const JWT_SECRET = process.env.JWT_SECRET;
import nodemailer from 'nodemailer' 
import moment from 'moment' 
import {format} from 'date-fns' 
import { v4 as uuidv4 } from 'uuid' 
import { promisify } from 'util' 
import { redisClient } from '../redis/redisConfig.js' 
import { TOTPGenerator } from '../utilities/TOTPGenerator.class.js' 



const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;



// Configure Winston for logging
const logger = winston.createLogger({
  level: 'info', // or whatever level you want to use
  format: winston.format.json(), // logs in JSON format
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs to `combined.log`
    // - Write all logs of level `error` and below to `error.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// If we're in development, also log to the `console` with the colorized simple format.
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Initialize Redis client
const getRedisAsync = promisify(redisClient.get).bind(redisClient);
const setRedisAsync = promisify(redisClient.set).bind(redisClient);



// Function to save the user's hashed password to the database
// Function to save a new user
const saveUser = async (userData) => {
  const { hashedPassword, username, agencyMemberUniqueId, fullname, first_name, last_name, email, address, phone, role } = userData;
  try {
    // Hash the password before saving the user

    // Create a new user record in the database
    const user = await User.create({
      password:hashedPassword,
      username,
      agencyMemberUniqueId,
      fullname,
      first_name,
      last_name,
      email,
      address,
      phone,
      role,
      // Include any other user fields here
    });

    // Return the created user object
    return { status: 'success', code: 200, message: "User created successfully", user };
  } catch (error) {
    // Log the error
    logger.error('Error saving user:', error);
    // Return the error object
    return { status: 'error', code: 500, message: error.message };
  }
};

const getUserByEmail = async (email) => {
  try {
    // Use Sequelize's findOne method to retrieve the user by email
    const user = await User.findOne({
      where: {
        email: email
      }
    });

    return user; // This will be 'null' if no user is found

  } catch (error) {
    // If there's a database error, log it and optionally throw an error
    logger.error('Error fetching user by email:', error);
    throw error; // Rethrowing the error will allow the caller to handle it
  }
};






export const doNothing = async (req, res) => {
  console.log("+++++++++++++++ AUTHENTICATE +++++++++++++++++++")
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      // return res.status(401).send('Authentication failed');
      return res.status(201).json({
        outcome: 'error',
        // error: 'User does not exist. Try again' 
        error: 'Sign in failed. Try again' 
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      console.log("Match");

      const totp = new TOTPGenerator();
      // console.log(totp);
      totp.generateOTP(email)
      .then(() => console.log('OTP sent to user email.'))
      .catch(error => console.error('Error generating or sending OTP:', error));

      return res.status(200).json({
        outcome: 'success', 
        message: "Successfully logged in: OTP send to " + req.body.email,
        email: req.body.email
      })
      // .send('OTP sent to email');

    } else {
      // console.log('Password does not match');
      return res.status(201).json({
        outcome: 'error',
        // error: 'Email "' + email + '" & Password "' + password + '" does not match. Try again'
        error: 'Sign in failed. Try again' 
      });
    }
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(201).json({
      outcome: 'error', 
      error: 'Sign in failed. Try again' 
    });
  }
};


export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const totp = new TOTPGenerator();
  let verified = await totp.verifyOTP(email, otp) 
  if (verified) {
    return res.status(200).json({
      outcome: 'success',
      token: jwt.sign({ email: email }, 'keyboard cat 4 ever', { expiresIn: 129600 })
    })
  } else {
    return res.status(200).json({
      outcome: 'error'
    })
  }
} 

// exports.verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;
//   try {
//     const storedOtp = await getAsync(`otp:${email}`);
//     if (otp === storedOtp) {
//       // OTP is correct, generate JWT
//       const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

//       // Clear OTP from Redis
//       await setRedisAsync(`otp:${email}`, '', 'EX', 1);

//       // return res.status(200).json({ token });

//       return res.status(200).json({
//         outcome: 'success', 
//         token: token
//       })

//     } else {

//       // return res.status(401).send('OTP verification failed');

//       return res.status(201).json({
//         outcome: 'error',
//         error: 'OTP verification failed. Try again' 
//       });

//     }
//   } catch (error) {

//     logger.error('OTP verification error:', error);

//     // return res.status(500).send('Internal server error');
//     return res.status(201).json({
//       outcome: 'error',
//       error: 'OTP verification failed. Try again' 
//     });

//   }
// }


export const register = async (req, res) => {
  const { email, password, agencyMemberUniqueId } = req.body;
  console.log(req.body)
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, hashedPassword, agencyMemberUniqueId, username: email };
    console.log("--------------------------------")
    const reg = await saveUser(newUser);
    console.log(reg);
    console.log("--------------------------------")
    return res.status(reg.code).send(reg.message);
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).send('Internal server error');
  }
}







export const loginLdap = async (req, res) => {
  /*
  $domain = 'judiciarytt.org';
  $ldapconfig['host'] = 'judiciarydc2.judiciarytt.org';
  $ldapconfig['port'] = 389;
  $ldapconfig['basedn'] = 'ou=users,ou=hoj,ou=1judiciarytt,ou=judiciarytt,dc=judiciarytt,dc=org';
  */
  //console.log("LDAP LOGIN")

  try{

    const username = req.body.username;
    const password = req.body.password;
    let ldapBaseDn = CONFIG.ldap.dn

 
    
    let options = {
      ldapOpts: { 
        url: 'ldap://judiciarydc2.judiciarytt.org:389' },
      //userDn: `uid=${username},judiciarydc2,dc=judiciarytt,dc=org`,
      //userDn: `uid=hhernandez,dc=judiciarytt,dc=org`,
      userDn: `uid=${username},${ldapBaseDn}`,
      userPassword: `${password}`,
      userSearchBase: ldapBaseDn,
      usernameAttribute: 'uid'
      //username: `${username}`,
      //userSearchBase: 'dc=judiciarytt,dc=org',
      //usernameAttribute: 'uid',
    }

    let user = await authenticate(options)


    auth.authenticate(username, password, function(err, user) {
      
    });
    
    
    
    /*
    const user = await User.findOne({ 
      where: {
          email: username ,
      }
    });
    */

    if (!user) {
      return res.json({ msg: "Please enter a valid username" });
    }
    console.log(user)

    let passHash = await bcrypt.hash(password, saltRounds)

    const user_role =  user.role;
    console.log("User role: "+user_role)
    const verbose_permissions = await Permission.findOne({
      where:{
        id: user_role
      }
    });

    var user_permissions = "";
    user_permissions = verbose_permissions?JSON.parse(JSON.stringify(verbose_permissions)):"";
    console.log("Permissions: "+user_permissions)
    const user_db_pass = user.password;
    //console.log("passHash: "+passHash)
    //console.log("user_db_pass: "+user_db_pass)
    const match = await bcrypt.compare(password, user_db_pass);
    //console.log(match)
    
    if(!match) {
      console.log(match)
      return res.json({ msg: "Username and or password is incorrect" });

    }

    
    const accessToken = jwt.sign(
      { username, id: user.id, permissions:JSON.stringify(user_permissions) },
      JWT_SECRET,
      {
        expiresIn: process.env.NODE_ENV === "production" ? "6h" : "2 days",
      }
    );
    res.json({ status:200, token: accessToken });
  }
  catch (err) {
    console.log(err);
    res.status(503).json({ msg: "Server error!" });
  }
};




export const refreshToken = async(req, res, next) =>
{
  const refreshTokenId = ctx.cookies.get(config.security.refreshToken.name, {
    signed: true,
  });

  const dbToken = await getExistingRefreshTokenById(refreshTokenId);

  if (!dbToken.id || dbToken.error) {
      ctx.throw(400, `The refresh token is not valid.`);
      return;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (dbToken.validityTimestamp <= currentTimestamp) {
      await deleteRefreshToken(refreshTokenId);

      ctx.throw(400, `The refresh token is expired.`);
      return;
  }

  const user = await getOne(dbToken.userId);

  if (!user || user.error) {
      ctx.throw(401, user.error || 'Invalid credentials.');
      return;
  }

  const token = jwt.sign(
      { username: user.username },
      config.security.jwt.secretkey,
      {
          expiresIn: config.security.jwt.expiration,
      }
  );

  ctx.body = {
      token: token,
      tokenExpiry: config.security.jwt.expiration,
      username: user.username,
  };
};




