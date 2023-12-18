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
dotenv.config()


// const externalApiUrl = process.env.EFILING_APP_URL || "https://eservices.ttlawcourts.org/filing/dev/api/swfapi.php"
const externalApiUrl = "https://eservices.ttlawcourts.org/filing/api/swfapi.php"

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
                  'address', 'phone', 'password', 'username', 'status', 'notifications', 'active', 
                  'role', 'resetToken', 'verifierId', 'hashValue', 'createdAt', 'updatedAt'
                ]
              },
            include: [{ 
                model: SignatureModel, 
                required: false,
                where: {
                    content_id: submissionId
                  }
            }]
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
    if(!submissionWithDetails){return res.status(400).send('error');}
    console.log("Submission Details")
    // Manipulate the response to remove previousDataValues
    const result = submissionWithDetails.get({ plain: true });
    // Delete the previousDataValues property if it exists
    delete result.previousDataValues;
    console.log(result)
    console.log(result.user.signatures[0].hash)


    function formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
      
        // Pad the hours, minutes and seconds with leading zeros, if required
        hours = hours.toString().padStart(2, '0');
        minutes = minutes.toString().padStart(2, '0');
        seconds = seconds.toString().padStart(2, '0');
      
        return `${hours}:${minutes}:${seconds}`;
      }


    const submissionDate = result?.createdAt.toISOString().split('T')[0];
    const submissionTime = formatTime(result?.createdAt);
    const signature = result?.user?.signatures?.[0]?.hash ?? '';
    const signFirstName = (result?.complainant?.firstName ?? '' ) 
    const signLastName = (result?.complainant?.lastName ?? '' ) 
    const signedName = (result?.complainant?.firstName ?? '' ) + " " + (result?.complainant?.lastName ?? '' )
    const complainantRank = (result?.complainant?.rank ?? '' ) 
    const complainantRegNum = (result?.complainant?.regNum ?? '' ) 
    






    console.log("============================================")
    //Build the efiling submission

    let docId;
    let courtOffice;
    let description = submissionWithDetails?.complainant?.courtDistrict || ""

    if(submissionWithDetails?.complainant?.courtDistrict){
        switch(submissionWithDetails.complainant.courtDistrict) {
            case 'District Court Complaint with Oath':
                docId = 'dcrim002';
            case 'District Court Complaint without Oath':
                docId = 'dcrim003';
            case 'High Court Complaint without Oath':
                docId = 'hcrim043';
            case 'High Court Complaint with Oath':
                docId = 'hcrim044';
            case 'Children Complaint':
                docId = 'cc001';
            default:
                docId = '-';
        }
    }

    let courtoffice;
    if (description.includes('North')) {
        courtoffice = 'pos';
    } else if (description.includes('South')) {
        courtoffice = 'sfo';
    } else if (description.includes('Tobago')) {
        courtoffice = 'tgo';
    } else {
        courtoffice = 'pos';
    }
    
    const efilingRecord = {
                "swftransid": "swif-"+req.body.submissionId,
                "email": submissionWithDetails.user.email,
                "userid": submissionWithDetails.user.id,
                "username": "",
                "court": "hcrim",   //this has to be updated
                "courtoffice": courtoffice,
                "court": "hcrim",   //this has to be updated
                "courtoffice": courtoffice,
                "type" : 1,
                "casenotes" : "TEST",
                "filingid" : submissionWithDetails.type || "TEST",
                "returnurl" : "http://swif.ttlawcourts.org/efiling/subs",
                "submissiondata": JSON.stringify(result) || "",
                // "doc_id": docId,
                // "doc_type":1,
                // "court": submissionWithDetails.complainant.court,
                // "signatureobject": submissionWithDetails?.signatures || []
    }

    console.log(efilingRecord)



    const signatureHTML = `
    
    <div
    id="acnhor-sign"
    style="
    border: 10px solid rgb(238, 238, 238);
    background-color: rgb(249, 249, 249);
    padding: 20px;
    margin: 25px 0px 0px;
    "
    >
    <div
    class="m-0 mb-3 text-left fw-bold"
    style="font-size: 20px; font-weight: bold"
    >
    Signed
    </div>
    <div style="margin: 10px 0px 20px; padding: 0px">
    <p style="font-size: 11pt; line-height: 14pt; margin: 0px">
        I <strong>${signFirstName} ${signLastName}</strong> ${complainantRank} <strong>${complainantRank}</strong>, hereby swear by
        affixing my signature to this declaration, that I make this complaint
        conscientiously having reasonable grounds for believing that the named
        accused person has committed the offence alleged and stated in the
        complaint and that the particulars are true to the best of my knowledge
    </p>
    </div>
    <div>
    <div class="signature-container">
        <div
        class="signature-format"
        style="background-color: rgb(255, 255, 255); padding:5px 5px; max-width:300px; border: 1px solid rgb(0,0,0)"
        >
        <div style="display: flex; font-family:Calibri, Arial, Helvetica, sans-serif"
    
        
        >
            <div class="col-6 col" style="width:150px;">
            <div class="logo-placeholder d-flex swf-sign">
                <span class="swf-e-signed"
                    style="font-size: .8rem;
                    font-weight: 700;
                    color: #555;"
                >e-signed on</span>
                <span class="swf-swif" 
                    style="font-size: 1rem;
                    font-weight: 700;
                    margin-left: 4px;
                    color: #c13127;"
                >SWiF</span>
            </div>
            </div>
            <div class="col-6 col"  class="col-6 col" style="width:145px;">
            <div
                class="text-placeholder text-right"
                style="font-size: 8pt; text-align: right"
            >
            ${submissionTime}
            </div>
            <div
                class="text-placeholder text-right"
                style="font-size: 8pt; text-align: right"
            >
            ${submissionDate}
            </div>
            </div>
        </div>
        <div class="col-12 col">
            <div class="name-placeholder fw-bold text-left"
            style="line-height: 13pt;
            font-size: 12pt;
            font-family:Calibri, Arial, Helvetica, sans-serif;
            font-weight:bold;
            margin: 5px 0;"
            >
            ${signedName}
            </div>
        </div>
        <div class="col-12 col">
            <div
            style="
                text-align:left; font-size: 8pt; overflow-wrap: break-word;
                word-break: break-all;
                line-height: 10pt"
            >
            ${signature}
            </div>
        </div>
        </div>
    </div>
    </div>
    <div id="anchorSign"></div>
    </div>
  `


    console.log("Efiling Record: ", JSON.stringify(efilingRecord))
    try {
        const { html, submissionId, jsondata} = req.body;
        // console.log(req.body);

        if (!html) {
            return res.status(400).send('No HTML content provided');
        }
        const htmlWithSignature = `<div><div>${html}</div> <div>${signatureHTML}</div></div>`
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlWithSignature);
        const pdf = await page.pdf({ 
            format: 'A4',
            printBackground: true,
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
        formData.append('jsondata', JSON.stringify(efilingRecord));
        // formData.append('jsondata', jsondata);
        // Send the PDF to the external API


        //*******************************PAUSED***************************** */
        const response = await axios.post(externalApiUrl, formData, {
            headers: formData.getHeaders()
        });
        
        console.log("-------------------------------");
        console.log(response.data);
        console.log("-------------------------------");
        // // Update the submission in the database
        await SubmissionModel.update(
            { 
                status: 'final',
                efilingId: response.data.efilingappcode, // Save the efilingappcode
                efilingResponse: JSON.stringify(response.data) // Save the entire response
                // efilingResponse: JSON.stringify(response.data) // Save the entire response
            }, 
            { where: { id: submissionId } }
        );
        res.json(response.data);
        //************************************************************ */
        res.send();
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


