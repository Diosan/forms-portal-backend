
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import moment from 'moment';
import {format} from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { db, UserModel, PasswordResetModel } from "../models/index.js";
import fs from "fs";
import formidable from 'formidable'
import {dbConfig} from "../config/db.config.js"
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import { TOTPGenerator } from '../utilities/TOTPGenerator.class.js' 
import { redisClient, } from '../redis/redisConfig.js';
import { mailConfig } from '../config/mail.config.js';
import crypto from 'crypto';
import { allowedDomains } from "../config/domains.config.js";
import { Sequelize } from "sequelize";

import createAgencyUserModel from "../models/users.model.js";
const createAgencyDbConnection = (agency) => {
  return new Sequelize(`swif_${agency}`, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
  });
};


const saltRounds = 10; 
const JWT_SECRET = process.env.JWT_SECRET;
const APP_DOMAIN = process.env.APP_DOMAIN;
const SWF_LOGO = process.env.SWF_LOGO;
const SWF_EMAIL = process.env.SWF_EMAIL;
const transporter = nodemailer.createTransport(mailConfig);






export const handlePasswordReset = async (req, res) => {
    const { token, password } = req.body; // Assuming token and new password are in the request body
    console.log(req.body)
    try {

        
        
        // Find the token in the database
        const passwordResetEntry = await PasswordResetModel.findOne({ where: { token } });

        // Check if the token exists and is not expired
        if (!passwordResetEntry || new Date() > passwordResetEntry.expiration) {
          console.log(passwordResetEntry.dataValues ||  "Invalid or expired token")
          // return res.json({ message: 'Invalid or expired token' }); -----------------
        }
        console.log(passwordResetEntry.dataValues ||  "nothing")

        let currentUser = await UserModel.findByPk(
          passwordResetEntry.dataValues.userId,
          {raw: true}
        );

        console.log('\n\n\n Current User : ' + ' \n\n\n');
        console.log(currentUser);
        const thisUserAgency = currentUser.agencyName.toLowerCase();


        const agencyDbConnection = createAgencyDbConnection(thisUserAgency);
        const AgencyUserModel = createAgencyUserModel(agencyDbConnection);


        // Hash the new password
        const hashedPassword = bcrypt.hashSync(password, 10);
        console.log("Hashed Password ++++++++++++++++++++++++++++++++++++++")
        console.log(hashedPassword)
        console.log("++++++++++++++++++++++++++++++++++++++")

        // Update the user's password
        await UserModel.update({ password: hashedPassword }, {
            where: { id: passwordResetEntry.userId } 
        });

        // Update the AGENCY USER password
        await AgencyUserModel.update({ password: hashedPassword }, {
          where: { id: passwordResetEntry.userId },
          using: agencyDbConnection,
        });

        const theUser = await UserModel.findOne({ 
          where: { id: passwordResetEntry.userId },
          order: [['createdAt', 'DESC']] 
         });
        // console.log(theUser ||  "no user")

        // return

        // Delete the token from the database
        await PasswordResetModel.destroy({ where: { userId: passwordResetEntry.userId } });

        console.log("------------Completed")

        // Send success response
        return res.json({ outcome: 'success' });

    } catch (error) {
        console.error('Error handling password reset:', error);
        return res.status(500).json({ message: 'An error occurred while processing your request' });
    }
};



export const resetPassword = async (req, res) => {
    console.log(req.body)
    // Validate request
    if (!req.body.password) {
      res.status(400).send({
        message: "Password can not be empty!"
      });
      return;
    }  
};

export async function generatePasswordResetToken(userEmail) {
    
  // Extract the domain from the email
  const emailDomain = userEmail.split("@").pop();
  const [agency = ""] = emailDomain.split(".") || [];
  const agencyUpper = agency.toUpperCase(); // This will convert 'agency' to uppercase

  // Check if the email domain is in the list of allowed domains
  if (!allowedDomains.includes("@" + emailDomain)) {
    return res.status(401).json({
      outcome: "error",
      error: `Access denied. Please use your ${agencyUpper} agency's email address.`,
    });
  }
  
  // Find the user by email
    const user = await UserModel.findOne({ where: { email: userEmail } });
    if (!user) {
      // return res.status(201).json({
      //   outcome: "error",
      //   // error: 'User does not exist. Try again'
      //   // error: "Sign in failed. Try again",
      //   error: `Account does not exist. 
      //   Please verify with your ${agencyUpper} IT Administrator that 
      //   your account has been set up.`
      // });
        throw new Error(`Account does not exist. 
          Please verify with your ${agencyUpper} IT Administrator that 
          your account has been set up.`);
    }
    

    






    // console.log(user)

    // console.log(updatedUser)
    const userFirstName = user?.dataValues?.firstName || ""
    const userId = user?.dataValues?.id || ""
    console.log(userId)

    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');

    // Set token expiration time (e.g., 1 hour)
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);


    // Store the token in the database
    await PasswordResetModel.create({
        userId: userId, 
        token: token,
        expiration: expirationTime
    });

    return {token:token, userFirstName:userFirstName, userId:userId || ""};
}

//handle Request to reset password from email
export const forgotPasswordRequest = async (req, res) => {
    
    const { token } = req.params; // Ensure you're using req.params and not req.parameters
    console.log("TOKEN: ", token)
    try {
      // Find the token in the database
      const passwordResetEntry = await PasswordResetModel.findOne({
        where: { token },
        // include: [{ model: UserModel }]
      });
      console.log("verdict: ",passwordResetEntry.expiration)
  
      // Check if the token exists and is not expired
      if (!passwordResetEntry || new Date() > passwordResetEntry.expiration) {
        // return res.status(400).send('Invalid or expired token');
        console.log("invalid: ")
        res.json({
            outcome: 'invalid',
            message: "Invalid or expired token",
            // token: token, // Include the token in the response
            // Optionally, include additional data if needed
          });
      }

      res.json({
        outcome: 'valid',
        message: "Token is valid.",
        // token: token, // Include the token in the response
        // Optionally, include additional data if needed
      });

      // Redirect the user to the password reset page
    //   res.redirect('http://localhost:5173/password/reset');
    //   res.send()
    } catch (error) {
      console.error('Error processing forgot password request:', error);
    //   res.status(500).send('An error occurred while processing your request');
      res.json({
        outcome: 'error',
        message: "Error",
        // token: token, // Include the token in the response
        // Optionally, include additional data if needed
      });
    }
};




