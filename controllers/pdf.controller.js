import { db, AdminUserModel } from "../models/index.js";
import fs from "fs";
import formidable from 'formidable'
import {dbConfig} from "../config/db.config.js"
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
const saltRounds = 10; 
import { TOTPGenerator } from '../utilities/TOTPGenerator.class.js' 
import { PDFGenerator } from '../utilities/PdfGenerator.class.js' 

import { redisClient, } from '../redis/redisConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));




export const generatePdf = async(req, res) =>{
    console.log(req.body);
    const data = req?.body || {}

    // generate the pdf
    const generator = new PDFGenerator(data, '../templates/form_template.json');
    generator.generatePDF('test_output/output.pdf')
    .then(outputPath => console.log(`PDF saved to ${outputPath}`))
    .catch(error => console.error('Error generating PDF:', error));


}