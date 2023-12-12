
import { db, ErrorLogModel, 
    SubmissionModel, 
    ComplainantModel, 
    UserModel, 
    AccusedModel,
    ChargesModel,
    SignatureModel,
    ChargeCodeModel
  
   } from "../models/index.js";
  import { PasswordResetModel} from "../models/index.js";
  
  import fs from "fs";
  import formidable from 'formidable'
  import {dbConfig} from "../config/db.config.js"
  import mysql from 'mysql2'
  import { Op } from "sequelize";
   
  
  import jwt from 'jsonwebtoken';
  import bcrypt from 'bcrypt';
  const saltRounds = 10;
  const JWT_SECRET = process.env.JWT_SECRET;
  import nodemailer from 'nodemailer';
  import moment from 'moment';
  import {format} from 'date-fns'
  import { v4 as uuidv4 } from 'uuid';
  import {TOTPGenerator} from '../utilities/TOTPGenerator.class.js';
  import SignOTPGenerator from "../utilities/SignOTPGenerator.class.js";
  import { Signatures } from "../utilities/Signatures.class.js";
  import {mailConfig} from '../config/mail.config.js';
  import axios  from "axios";
  import { SubmissionMailer } from "../utilities/SubmissionMailer.class.js";
  
  
  
  
  const ErrorLog = ErrorLogModel;

  export const chargeCodes = async (req, res) => {

    let charge_codes = await ChargeCodeModel.findAll();
    return res.status(201).json({
      charge_codes: charge_codes
    });
    
  }