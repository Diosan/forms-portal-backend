
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
            return res.json({ message: 'Invalid or expired token' });
        }
        console.log(passwordResetEntry.dataValues ||  "nothing")
        // Hash the new password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Update the user's password
        await UserModel.update({ password: hashedPassword }, {
            where: { id: passwordResetEntry.userId } 
        });

        const theUser = await UserModel.findOne({ where: { id: passwordResetEntry.userId } });
        console.log(theUser ||  "no user")

        // Delete the token from the database
        await PasswordResetModel.destroy({ where: { userId: passwordResetEntry.userId } });

        // Send success response
        return res.json({ message: 'Password successfully reset' });

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
    // Find the user by email
    const user = await UserModel.findOne({ where: { email: userEmail } });
    if (!user) {
        throw new Error('User not found');
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




