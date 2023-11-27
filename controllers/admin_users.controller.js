import { db, AdminUserModel } from "../models/index.js";
import fs from "fs";
import formidable from 'formidable'
import {dbConfig} from "../config/db.config.js"
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
const saltRounds = 10; 
import { TOTPGenerator } from '../utilities/TOTPGenerator.class.js' 
import { redisClient, } from '../redis/redisConfig.js';




// create a new user
export const create = async (req, res) => {
    console.log(req.body)
    if (!req.body) {
        res.status(500).json({ error: err.message });
        return;
    }
    //return
    const { username, agency, password, fullname, firstName, middleName, lastName, email, address, phone, role } = req.body;
    const hash = await bcrypt.hash(password, saltRounds);
    AdminUserModel.create({
        username: email,
        password: hash,
        fullname: fullname,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        email: email,
        address: address,
        phone: phone, 
        role: role,
        agency: agency
    })
    .then(user => {
        res.status(200).send({ message: "User created successfully!" });
    })
    .catch(err => {
        console.error(err);
        res.status(500).send({ message: err.message });
    });
};

// retrieve all users
export const findAll = (req, res) => {
    AdminUser.findAll()
        .then(users => {
            res.status(200).send(users);
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

// find a user by id
export const findOne = (req, res) => {
    const id = req.params.id;
    AdminUser.findByPk(id)
        .then(user => {
            if (!user) {
                res.status(404).send({ message: "User not found." });
                return;
            }
            res.status(200).send(user);
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });
    };
    
// update a user by id
export const update = (req, res) => {
    const id = req.params.id;
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const { firebaseId, username, password, fullname, firstName, middleName, lastName, email, address, phone, role } = fields;
        AdminUser.update({
            firebaseId: firebaseId,
            username: username,
            password: password,
            fullname: fullname,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            email: email,
            address: address,
            phone: phone,
            role: role
        }, {
            where: { id: id }
        })
            .then(() => {
                res.status(200).send({ message: "User updated successfully." });
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });
    });
};

// delete a user by id
export const del = (req, res) => {
    const id = req.params.id;
    AdminUser
    .destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.status(200).send({ message: "User deleted successfully!" });
            } else {
                res.status(404).send({ message: "User not found." });
            }
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

export const adminLogin = async (req, res) => {
    if (!req.body) {
        res.status(400).json({ error: "Request body is empty" });
        return;
    }
    // console.log(req.body);

    const { username, password } = req.body;
    const email = username;
    const plainTextPassword = password;
    // console.log(email);
    try {
        console.log(email);
        const user = await getUserByEmail(email);
        if (!user && !user.dataValues && !user.dataValues.password && !user.dataValues.email) {
            res.status(404).json({ status: 'error', message: "User not found" });
            return;
        }
        console.log(user);

        const storedPassword = user?.dataValues?.password || "";
        const passwordMatch = await bcrypt.compare(plainTextPassword, storedPassword);
        if (passwordMatch) {
            // Generate OTP and handle it here
            try {
                const totp = new TOTPGenerator();
                await totp.generateOTP(req.session.id, user.dataValues.email);
                return({
                    status: 'ok',
                    message: `An OTP code has been sent to your agency email address. Please enter the code in the box below`
                });
            } catch (error) {
                console.error('Error generating or sending OTP:', error);
                return({ status: 'error', message: "An error occurred. Please try again" });
            }
        } else {
            return{ status: 'error', message: "Password does not match" };
        }
    } catch (error) {
        return({ status: 'error', message: "An error occurred. Please try again" });
    }
};

export const verifyOtp = async (req, res) => {
    let verified = await getStoredOTP(`${otp}:req.session.id`) 
    if (verified) {
      return res.status(200).json({
        outcome: 'success',
      })
    } else {
      return res.status(200).json({
        outcome: 'error'
      })
    }
} 


export const getUserByEmail = async (email) => {
    console.log(email)
    try {
      // Use Sequelize's findOne method to retrieve the user by email
      const user = await AdminUserModel.findOne({
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



export const getStoredOTP = async(theKey) =>{
    console.log("get this key: ",theKey);
    const stored_OTP = await redisClient.get(theKey);
    console.log("the stored otp: ", stored_OTP)
    if(stored_OTP){
      return({status: "ok", code: stored_OTP})
    }else{
      return({status: "error"})
    }
}

export const deleteStoredOTP = async(theKey) =>{
    const delKey = await client.del(theKey);
    if(delKey){
      return({status: "ok"})
    }else{
      return({status: "error"})
    }
}


    