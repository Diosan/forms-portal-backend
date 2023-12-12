import fs from "fs";
import formidable from 'formidable'
import {dbConfig} from "../config/db.config.js"
import mysql from 'mysql2'
import bcrypt from 'bcrypt'
const saltRounds = 10; 
import { TOTPGenerator } from '../utilities/TOTPGenerator.class.js' 
import { PDFGenerator } from '../utilities/PdfGenerator.class.js' 
// import pdf from 'html-pdf';
import axios from 'axios';
import { redisClient, } from '../redis/redisConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { db, SubmissionModel, ComplainantModel, ConvictionModel, UserModel, ChargesModel, PendingModel, AccusedModel, SignatureModel, RelatedMatterModel } from "../models/index.js";
import FormData from 'form-data';
import dotenv from 'dotenv';


const externalApiUrl = process.env.EFILING_APP_URL || "https://eservices.ttlawcourts.org/filing/dev/api/swfapi.php"
const __dirname = path.dirname(fileURLToPath(import.meta.url));



// const submissionWithDetails = await SubmissionModel.findOne({
//     where: {
//       id: yourSubmissionId // replace with the ID of the submission you want to fetch
//     },
//     include: [
//       {
//         model: ComplainantModel,
//         required: false // Change to true if a complainant must exist for a submission
//       },
//       {
//         model: AccusedModel,
//         required: false,
//         include: [
//           { model: ChargesModel, required: false },
//           { model: PendingModel, required: false },
//           { model: ConvictionModel, required: false },
//           { model: RelatedMatterModel, required: false }
//         ]
//       },
//       {
//         model: UserModel, // Assuming you want to fetch user data for the submission
//         required: false,
//         include: [
//           { model: SignatureModel, required: false }
//           // Include other models associated with UserModel as needed
//         ]
//       }
//       // Include other models as needed
//     ]
//   });

async function getSubmissionWithDetails(submissionId) {
    console.log("ID: ",submissionId)
    try {
      const submissionWithDetails = await SubmissionModel.findOne({
        where: {
          id: submissionId
        },
        include: [
          {
            model: ComplainantModel,
            required: false
          },
          {
            model: AccusedModel,
            required: false,
            include: [
              { model: ChargesModel, required: false },
              { model: PendingModel, required: false },
              { model: ConvictionModel, required: false },
              { model: RelatedMatterModel, required: false }
            ]
          },
          {
            model: UserModel,
            required: false,
            attributes: {
                exclude: [
                  'password', 'username', 'status', 'notifications', 'active', 
                  'role', 'resetToken', 'verifierId', 'hashvalue', 'createdAt', 'updatedAt'
                ]
              },
            include: [{ model: SignatureModel, required: false }]
          }
          // ... other models as needed
        ]
      });
  
      return submissionWithDetails;
    } catch (error) {
      // Handle or throw the error based on your error handling policy
      console.error('Error fetching submission details:', error);
      throw error;
    }
  }
  
  





// Create 'documents' directory if it doesn't exist
const documentsPath = path.join( __dirname, "..", 'documents');
if (!fs.existsSync(documentsPath)) {
  fs.mkdirSync(documentsPath, { recursive: true });
}

// // Ensure the 'documents' directory exists
// if (!fs.existsSync(documentsPath)) {
//     fs.mkdirSync(documentsPath, { recursive: true });
// }





export const generatePdf = async(req, res) =>{
    console.log(req.body);
    const data = req?.body || {}

    // generate the pdf
    const generator = new PDFGenerator(data, '../templates/form_template.json');

    try {
        const pdfPath =  await generator.generatePDF('test_output/output.pdf')
        console.log(`PDF saved`);
        res.sendFile(pdfPath);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating PDF');
    }

}


// Function to convert HTML to PDF
function htmlToPDF(html) {
    return new Promise((resolve, reject) => {
        pdf.create(html, { format: 'A4' }).toBuffer((err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        });
    });
}


// Express route handler to convert HTML to PDF and send it to the client
export const convertHtmlPdf = async (req, res) => {
    try {
        const html = req.body.html; // Assuming the HTML is sent in the body of the request under 'html' key
        if (!html) {
            return res.status(400).send("No HTML content provided.");
        }

        const pdfBuffer = await htmlToPDF(html);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};




export const incomingPDF = async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    try {
        console.log('processing');
        
        let uploadedPdf = req.files.pdf;

        // Validate that the file is a PDF
        if (uploadedPdf.mimetype !== 'application/pdf') {
            return res.status(400).send('Invalid file type. Only PDF files are allowed.');
        }

        // Generate or retrieve submission ID
        const submissionId = req.body.submissionId; // adjust according to how the ID is sent

        // Construct the filename as "submission-[submission_id].pdf"
        const filename = `submission-${submissionId}.pdf`;
        const savePath = path.join(documentsPath, filename);

        // Move the file to the 'documents' directory
        // This operation will automatically overwrite the file if it exists
        uploadedPdf.mv(savePath, (err) => {
            if (err) {
                console.error('Error saving the file:', err);
                return res.status(500).send('Error processing your request.');
            }
            console.log('File saved:', savePath);
            res.send('PDF received and processed');
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request.');
    }
};



export const convertWithPuppeteer = async (req, res) => {

    if (!req.body || Object.keys(req.body).length === 0 || !req.body.submissionId) {
        return res.status(500).send('An error occurred');
    }
    
    console.log("Submission ID:  ", req.body.submissionId)
    // return res.send()
    const submissionWithDetails = await getSubmissionWithDetails(req.body.submissionId);
    console.log("Submission Details")
    // Manipulate the response to remove previousDataValues
    const result = submissionWithDetails.get({ plain: true });
    // Delete the previousDataValues property if it exists
    delete result.previousDataValues;
    console.log(result)
    console.log("============================================")
    // return res.send()

    console.log("Efiling: ",externalApiUrl)
    try {
        const { html, submissionId, jsondata } = req.body;
        // console.log(req.body);

        if (!html) {
            return res.status(400).send('No HTML content provided');
        }

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf({ 
            format: 'A4',
            margin: {
                top: '7mm',    
                right: '20mm',  
                bottom: '20mm',
                left: '7mm'    
            }
        });

        await browser.close();

        // Ensure the documents directory exists
        if (!fs.existsSync(documentsPath)){
            fs.mkdirSync(documentsPath, { recursive: true });
        }

        // Create a file path for the PDF
        const pdfPath = path.join(documentsPath, `submission_${submissionId}.pdf`);

        // Write the PDF to disk
        fs.writeFileSync(pdfPath, pdf);

        // Prepare the data for sending to the external API
        const formData = new FormData();
        formData.append('fileupload', fs.createReadStream(pdfPath));
        formData.append('jsondata', jsondata);

        // Send the PDF to the external API
        const response = await axios.post(externalApiUrl, formData, {
            headers: formData.getHeaders()
        });

        // Update the submission in the database
        await SubmissionModel.update(
            { 
                status: 'final',
                efilingId: response.data.efilingappcode, // Save the efilingappcode
                efilingResponse: JSON.stringify(response.data) // Save the entire response
            }, 
            { where: { id: submissionId } }
        );
        res.json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error in processing: ' + error.message);
    }
};


// export const convertWithPuppeteer = async (req, res) => {
//     try {
//         const { html, submissionId, jsondata } = req.body;

//         if (!html) {
//             return res.status(400).send('No HTML content provided');
//         }

//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(html);
//         const pdf = await page.pdf({ 
//             format: 'A4',
//             margin: {
//                 top: '7mm',    
//                 right: '20mm',  
//                 bottom: '20mm',
//                 left: '7mm'    
//             }
//         });

//         await browser.close();

//         // Ensure the documents directory exists
//         if (!fs.existsSync(documentsPath)){
//             fs.mkdirSync(documentsPath, { recursive: true });
//         }

//         // Create a file path for the PDF
//         const pdfPath = path.join(documentsPath, `submission_${submissionId}.pdf`);

//         // Write the PDF to disk
//         fs.writeFileSync(pdfPath, pdf);

//         // Prepare the data for sending to the external API
//         const formData = new FormData();
//         formData.append('fileupload', fs.createReadStream(pdfPath));
//         formData.append('jsondata', JSON.stringify(jsondata));

//         // Send the PDF to the external API
//         const response = await axios.post(externalApiUrl, formData, {
//             headers: formData.getHeaders()
//         });

//         // Handle the external API's response
//         // Assuming the response contains the necessary data to send back to the client
//         res.json(response.data);
//     } catch (error) {
//         res.status(500).send('Error in processing: ' + error.message);
//     }
// };




// export const convertWithPuppeteer = async (req, res) => {
//     try {
//         const { html, submissionId } = req.body;

//         if (!html) {
//             return res.status(400).send('No HTML content provided');
//         }

//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(html);
//         const pdf = await page.pdf({ 
//             format: 'A4',
//             margin: {
//                 top: '7mm',    
//                 right: '20mm',  
//                 bottom: '20mm',
//                 left: '7mm'    
//             }
//         });

//         await browser.close();

//         // Ensure the documents directory exists
//         if (!fs.existsSync(documentsPath)){
//             fs.mkdirSync(documentsPath, { recursive: true });
//         }

//         // Create a file path for the PDF
//         const pdfPath = path.join(documentsPath, `submission_${submissionId}.pdf`);

//         // Write the PDF to disk
//         fs.writeFileSync(pdfPath, pdf);

//         // Send the PDF to the client
//         res.contentType('application/pdf');
//         res.send(pdf);
//     } catch (error) {
//         res.status(500).send('Error generating PDF: ' + error.message);
//     }
// };



// export const convertWithPuppeteer = async (req, res) => {
//     try {
//         const { html, submissionId } = req.body;

//         if (!html) {
//             return res.status(400).send('No HTML content provided');
//         }

//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(html);
//         const pdf = await page.pdf({ 
//             format: 'A4',
//             margin: {
//                 top: '7mm',    // Specify top margin
//                 right: '20mm',  // Specify right margin
//                 bottom: '20mm', // Specify bottom margin
//                 left: '7mm'    // Specify left margin
//             }
//          });

//         await browser.close();

//         res.contentType('application/pdf');
//         res.send(pdf);
//     } catch (error) {
//         res.status(500).send('Error generating PDF: ' + error.message);
//     }
// };


