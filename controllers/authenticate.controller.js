import dotenv from "dotenv";
dotenv.config();
// const AccessLog = db.accesslogs;
import formidable from "formidable";
import { db, UserModel } from "../models/index.js";

// const User = db.users;
// const Permission = db.permissions;
// const Op = db.Sequelize.Op;
import winston from "winston";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import moment from "moment";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import { redisClient } from "../redis/redisConfig.js";
import { TOTPGenerator } from "../utilities/TOTPGenerator.class.js";
import { logAuthenticationEvent } from "../utilities/logger.js";
import { allowedDomains } from "../config/domains.config.js";
import { dbConfig } from "../config/db.config.js";

import { Sequelize } from "sequelize";
import createAgencyUserModel from "../models/users.model.js";
const createAgencyDbConnection = (agency) => {
  return new Sequelize(`swif_${agency}`, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
  });
};

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

// Configure Winston for logging
const logger = winston.createLogger({
  level: "info", // or whatever level you want to use
  format: winston.format.json(), // logs in JSON format
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs to `combined.log`
    // - Write all logs of level `error` and below to `error.log`
    //
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// If we're in development, also log to the `console` with the colorized simple format.
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Initialize Redis client
const getRedisAsync = promisify(redisClient.get).bind(redisClient);
const setRedisAsync = promisify(redisClient.set).bind(redisClient);

// Function to save the user's hashed password to the database
// Function to save a new user
const saveUser = async (userData) => {
  const {
    hashedPassword,
    username,
    agencyMemberUniqueId,
    fullname,
    first_name,
    last_name,
    email,
    address,
    phone,
    role,
  } = userData;
  try {
    // Hash the password before saving the user

    // Create a new user record in the database
    const user = await UserModel.create({
      password: hashedPassword,
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
    return {
      status: "success",
      code: 200,
      message: "User created successfully",
      user,
    };
  } catch (error) {
    // Log the error
    logger.error("Error saving user:", error);
    // Return the error object
    return { status: "error", code: 500, message: error.message };
  }
};

const getUserByEmail = async (email, agency) => {
  try {
    console.log("email::::::::::", email);
    const agencyDbConnection = createAgencyDbConnection(agency);
    const AgencyUserModel = createAgencyUserModel(agencyDbConnection);
    // Use Sequelize's findOne method to retrieve the user by email
    const agencyUser = await AgencyUserModel.findOne({
      where: {
        email: email,
      },
      using: agencyDbConnection,
    });
    if (!agencyUser) {
      return null;
    }
    console.log(">>>>>>>>AGENCY USER: ", agencyUser);
    const swifUser = await UserModel.findOne({
      where: {
        email: email,
      },
    });
    console.log(">>>>>>>>SWIF USER: ", swifUser);
    if (!swifUser) {
      return null;
    }
    //you can choose to update the swif user with the most current agency user data
    const updatedAgencyUserData = {
      // Define the fields you want to update and their new values
      firstName: agencyUser.dataValues.firstName || "",
      lastName: agencyUser.dataValues.lastName || "",
      agencyMemberUniqueId: agencyUser.dataValues.agencyMemberUniqueId,
    };
    console.log("UPDATED DATA:", updatedAgencyUserData);
    console.log(swifUser.dataValues.id);

    // Update the user record in the central user table
    await UserModel.update(updatedAgencyUserData, {
      where: {
        id: swifUser.id, // Assuming 'id' is the primary key
      },
    });
    return agencyUser
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
};

export const doNothing = async (req, res, next) => {
  console.log("+++++++++++++++ AUTHENTICATE +++++++++++++++++++");
};

export const login = async (req, res, next) => {
  console.log(req.body);
  const { email, password } = req.body;

  // Extract the domain from the email
  const emailDomain = email.split("@").pop();
  const [agency = ""] = emailDomain.split(".") || [];
  const agencyUpper = agency.toUpperCase(); // This will convert 'agency' to uppercase

  console.log(agency);

  // Check if the email domain is in the list of allowed domains
  if (!allowedDomains.includes("@" + emailDomain)) {
    return res.status(401).json({
      outcome: "error",
      error: `Access denied. Please use your ${agencyUpper} agency's email address to log in.`,
    });
  }

  //1 check if the user account is active in the agency (get updated first name and last name and id)
  //2 check if the user accoount exists on swif
  //3 login the user on swif

  try {
    const user = await getUserByEmail(email, agency);
    // console.log(user)
    if (!user) {
      // return res.status(401).send('Authentication failed');
      return res.status(201).json({
        outcome: "error",
        // error: 'User does not exist. Try again'
        // error: "Sign in failed. Try again",
        error: `Account does not exist. 
        Please verify with your ${agencyUpper} IT Administrator that 
        your account has been set up.`,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      console.log("Match");

      const totp = new TOTPGenerator();
      // console.log(totp);
      //add user id to the session object
      // req.session.uid = user.id
      const userId = user?.dataValues?.id || "";
      const name = user?.dataValues?.firstName || "";
      console.log(name);

      const token = jwt.sign(
        { id: userId, agency: agency },
        process.env.JWT_SECRET,
        {
          expiresIn: "6h",
        }
      );
      console.log(token);

      totp
        .generateOTP(token, email, name)
        .then(() => {
          console.log("OTP sent to user email.");
          const loggedUser = { email: email, id: userId };
          logAuthenticationEvent(
            "OTP sent to user email",
            loggedUser,
            "Username and password correct. Awaiting OTP authentication"
          );
        })
        .catch((error) =>
          console.error("Error generating or sending OTP:", error)
        );

      return res.status(200).json({
        outcome: "success",
        message: "Successfully logged in: OTP send to " + req.body.email,
        email: req.body.email,
        token: token, // Include the token in the response
      });

      // .send('OTP sent to email');
    } else {
      logAuthenticationEvent(
        "Password does not match",
        email,
        "Incorrect Passord"
      );

      console.log("Password does not match");
      // console.log(token)
      const customError = new Error("Incorrect Passord");
      customError.status = 200; // HTTP status code
      customError.outcome = "error";
      (customError.publicMessage = "Incorrect username or password"),
        customError.email;

      customError.customResponse = true; // Indicate that this error should return a custom JSON response
      next(customError);

      // return res.status(201).json({
      //   outcome: 'error',
      //   // error: 'Email "' + email + '" & Password "' + password + '" does not match. Try again'
      //   error: 'Sign in failed. Try again'
      // });
    }
  } catch (error) {
    // logger.error('Login error:', error);
    console.log(error);
    const customError = new Error("Sign in failed");
    customError.status = 201; // HTTP status code
    customError.outcome = "error";
    customError.publicMessage = "Sign in failed. Try again";
    customError.customResponse = true; // Indicate that this error should return a custom JSON response
    next(customError);
  }
};

export const verifyOtp = async (req, res, next) => {
  const authHeader = req?.headers?.authorization || "";
  const { otp } = req.body;

  if (!otp || !authHeader || !authHeader.startsWith("Bearer ")) {
    const customError = new Error("No token provided");
    customError.status = 401; // HTTP status code
    customError.outcome = "error";
    customError.publicMessage = "No token provided";
    customError.customResponse = true; // Indicate that this error should return a custom JSON response
    next(customError);
  }

  const token = authHeader.split(" ")[1];

  // Verify and decode the JWT token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(">>>> Decoded - ", decoded);
    // Assuming the user's ID is stored in the token
    const userId = decoded.id;
    console.log(">>>> USER ID decoded - ", userId);

    const totp = new TOTPGenerator();
    let verified = await totp.verifyOTP(token, otp);

    if (verified) {
      // OTP is correct, create a new token or perform desired actions
      return res.status(200).json({
        outcome: "success",
        token: jwt.sign({ id: userId }, process.env.JWT_SECRET, {
          expiresIn: 129600,
        }),
      });
    } else {
      // OTP is incorrect
      console.log("OTP verification failed");
      const customError = new Error("OTP verification failed");
      customError.status = 400; // HTTP status code
      customError.outcome = "error";
      customError.publicMessage = "OTP verification failed";
      customError.customResponse = true; // Indicate that this error should return a custom JSON response
      next(customError);
    }
  } catch (error) {
    // Handle errors (e.g., token invalid or expired)
    console.error("Error verifying OTP:", error);
    const customError = new Error("Invalid Token used");
    customError.status = 401; // HTTP status code
    customError.outcome = "error";
    customError.publicMessage = "Invalid token";
    customError.customResponse = true; // Indicate that this error should return a custom JSON response
    next(customError);
  }
};

export const resendOtp = async (req, res, next) => {
  const authHeader = req?.headers?.authorization || "";
  const { email } = req.body;

  if (!email || !authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ outcome: "error", message: "error" });
  }
  try {
    const oldToken = await authHeader.split(" ")[1];
    console.log(oldToken);

    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
    // Assuming the user's ID is stored in the token
    console.log(decoded);

    if (!decoded || !decoded.id || !decoded.agency) {
      console.log("got an error");
      return res
        .status(404)
        .json({ outcome: "error", message: "User not found" });
    }
    const userId = decoded.id;
    const agency = decoded.agency;

    console.log(">>>> USER ID decoded - ", userId);
    // Fetch user by ID
    const agencyDbConnection = createAgencyDbConnection(agency);
    const AgencyUserModel = createAgencyUserModel(agencyDbConnection);
    const user = await AgencyUserModel.findByPk(userId);
    console.log("user....", user);

    if (!user) {
      return res
        .status(404)
        .json({ outcome: "error", message: "User not found" });
    }
    console.log("User found");
    const userAuthorisedEmail = user.dataValues.email;
    const userAuthorisedName = user.dataValues.firstName;
    // Generate a new JWT token
    const newToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    // Generate and send OTP
    const totp = new TOTPGenerator();
    totp
      .generateOTP(newToken, userAuthorisedEmail, userAuthorisedName)
      .then(() => console.log("OTP sent to user email."))
      .catch((error) =>
        console.error("Error generating or sending OTP:", error)
      );

    return res.status(200).json({
      outcome: "success",
      message:
        "Successfully logged in: OTP send to your authorised email address",
      token: newToken, // refresh user token
    });
  } catch (error) {
    console.log(error);
    const customError = new Error("Resend OTP error");
    customError.status = 201; // HTTP status code
    customError.outcome = "error";
    customError.publicMessage = "Sign in failed. Try again";
    customError.customResponse = true; // Indicate that this error should return a custom JSON response
    next(customError);
  }
};

export const register = async (req, res, next) => {
  const { email, password, agencyMemberUniqueId } = req.body;
  console.log(req.body);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email,
      hashedPassword,
      agencyMemberUniqueId,
      username: email,
    };
    console.log("--------------------------------");
    const reg = await saveUser(newUser);
    console.log(reg);
    console.log("--------------------------------");
    return res.status(reg.code).send(reg.message);
  } catch (error) {
    // logger.error("Registration error:", error);
    // return res.status(500).send("Internal server error");
    // next(error);

    const customError = new Error("Registration error:");
    customError.status = 500; // HTTP status code
    customError.outcome = "error";
    customError.publicMessage = "Registration error";
    customError.customResponse = true; // Indicate that this error should return a custom JSON response
    next(customError);
  }
};

export const refreshToken = async (req, res, next) => {
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
    ctx.throw(401, user.error || "Invalid credentials.");
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
