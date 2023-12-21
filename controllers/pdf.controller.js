import fs from "fs";
import formidable from "formidable";
import { dbConfig } from "../config/db.config.js";
import mysql from "mysql2";
import bcrypt from "bcrypt";
const saltRounds = 10;
import { TOTPGenerator } from "../utilities/TOTPGenerator.class.js";
import { PDFGenerator } from "../utilities/PdfGenerator.class.js";
// import pdf from 'html-pdf';
import axios from "axios";
import { redisClient } from "../redis/redisConfig.js";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import {
  db,
  SubmissionModel,
  ComplainantModel,
  ConvictionModel,
  UserModel,
  ChargesModel,
  PendingModel,
  AccusedModel,
  SignatureModel,
  RelatedMatterModel,
} from "../models/index.js";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

// const externalApiUrl = process.env.EFILING_APP_URL || "https://eservices.ttlawcourts.org/filing/dev/api/swfapi.php"
const externalApiUrl =
  "https://eservices.ttlawcourts.org/filing/api/swfapi.php";

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
  console.log("ID: ", submissionId);
  try {
    const submissionWithDetails = await SubmissionModel.findOne({
      where: {
        id: submissionId,
      },
      include: [
        {
          model: ComplainantModel,
          required: false,
        },
        {
          model: AccusedModel,
          required: false,
          include: [
            { model: ChargesModel, required: false },
            { model: PendingModel, required: false },
            { model: ConvictionModel, required: false },
            { model: RelatedMatterModel, required: false },
          ],
        },
        {
          model: UserModel,
          required: false,
          attributes: {
            exclude: [
              "address",
              "phone",
              "password",
              "username",
              "status",
              "notifications",
              "active",
              "role",
              "resetToken",
              "verifierId",
              "hashValue",
              "createdAt",
              "updatedAt",
            ],
          },
          include: [
            {
              model: SignatureModel,
              required: false,
              where: {
                content_id: submissionId,
              },
            },
          ],
        },
        // ... other models as needed
      ],
    });

    return submissionWithDetails;
  } catch (error) {
    // Handle or throw the error based on your error handling policy
    console.error("Error fetching submission details:", error);
    throw error;
  }
}

// Create 'documents' directory if it doesn't exist
const documentsPath = path.join(__dirname, "..", "documents");
if (!fs.existsSync(documentsPath)) {
  fs.mkdirSync(documentsPath, { recursive: true });
}

// // Ensure the 'documents' directory exists
// if (!fs.existsSync(documentsPath)) {
//     fs.mkdirSync(documentsPath, { recursive: true });
// }

export const generatePdf = async (req, res) => {
  console.log(req.body);
  const data = req?.body || {};

  // generate the pdf
  const generator = new PDFGenerator(data, "../templates/form_template.json");

  try {
    const pdfPath = await generator.generatePDF("test_output/output.pdf");
    console.log(`PDF saved`);
    res.sendFile(pdfPath);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating PDF");
  }
};

// Function to convert HTML to PDF
function htmlToPDF(html) {
  return new Promise((resolve, reject) => {
    pdf.create(html, { format: "A4" }).toBuffer((err, buffer) => {
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
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=download.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const incomingPDF = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  try {
    console.log("processing");

    let uploadedPdf = req.files.pdf;

    // Validate that the file is a PDF
    if (uploadedPdf.mimetype !== "application/pdf") {
      return res
        .status(400)
        .send("Invalid file type. Only PDF files are allowed.");
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
        console.error("Error saving the file:", err);
        return res.status(500).send("Error processing your request.");
      }
      console.log("File saved:", savePath);
      res.send("PDF received and processed");
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while processing the request.");
  }
};

export const convertWithPuppeteer = async (req, res) => {
  if (
    !req.body ||
    Object.keys(req.body).length === 0 ||
    !req.body.submissionId
  ) {
    return res.status(500).send("An error occurred");
  }
  try {
    console.log("Submission ID:  ", req.body.submissionId);
    // return res.send()
    const submissionWithDetails = await getSubmissionWithDetails(
      req.body.submissionId
    );
    if (!submissionWithDetails) {
      return res.status(400).send("error");
    }
    console.log("Submission Details");
    // Manipulate the response to remove previousDataValues
    const result = submissionWithDetails.get({ plain: true });
    // Delete the previousDataValues property if it exists
    delete result.previousDataValues;
    console.log(result);
    console.log(result?.user?.signatures[0]?.hash);

    function formatTime(date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();

      // Pad the hours, minutes and seconds with leading zeros, if required
      hours = hours.toString().padStart(2, "0");
      minutes = minutes.toString().padStart(2, "0");
      seconds = seconds.toString().padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;
    }

    const submissionDate = result?.createdAt.toISOString().split("T")[0];
    const submissionTime = formatTime(result?.createdAt);
    const signature = result?.user?.signatures?.[0]?.hash ?? "";
    const signFirstName = result?.complainant?.firstName ?? "";
    const signLastName = result?.complainant?.lastName ?? "";
    const signedName =
      (result?.complainant?.firstName ?? "") +
      " " +
      (result?.complainant?.lastName ?? "");
    const complainantRank = result?.complainant?.rank ?? "";
    const complainantRegNum = result?.complainant?.regNum ?? "";

    const summaryOfEidence = result?.summaryOfEvidence ?? "";

    console.log("============================================");
    //Build the efiling submission

    let docId;
    let courtOffice;
    let description = submissionWithDetails?.complainant?.courtDistrict || "";

    if (submissionWithDetails?.complainant?.courtDistrict) {
      switch (submissionWithDetails.complainant.courtDistrict) {
        case "District Court Complaint with Oath":
          docId = "dcrim002";
        case "District Court Complaint without Oath":
          docId = "dcrim003";
        case "High Court Complaint without Oath":
          docId = "hcrim043";
        case "High Court Complaint with Oath":
          docId = "hcrim044";
        case "Children Complaint":
          docId = "cc001";
        default:
          docId = "-";
      }
    }

    let courtoffice;
    if (description.includes("North")) {
      courtoffice = "pos";
    } else if (description.includes("South")) {
      courtoffice = "sfo";
    } else if (description.includes("Tobago")) {
      courtoffice = "tgo";
    } else {
      courtoffice = "pos";
    }

    const efilingRecord = {
      swftransid: "swif-" + req.body.submissionId,
      email: submissionWithDetails.user.email,
      userid: submissionWithDetails.user.id,
      username: "",
      court: "hcrim", //this has to be updated
      courtoffice: courtoffice,
      court: "hcrim", //this has to be updated
      courtoffice: courtoffice,
      type: 1,
      casenotes: "TEST",
      filingid: submissionWithDetails.type || "TEST",
      returnurl: "http://swif.ttlawcourts.org/efiling/subs",
      submissiondata: JSON.stringify(result) || "",
      // "doc_id": docId,
      // "doc_type":1,
      // "court": submissionWithDetails.complainant.court,
      // "signatureobject": submissionWithDetails?.signatures || []
    };

    console.log(efilingRecord);



    const htmlHead = `
                <html>  <head>    <style>    body {
                    font-family: 'Arial', sans-serif;  line-height:1.2rem;
                }
                *{font-size:9pt; line-height:1.2rem}
                        
                        .signature-format {
                            width: 300px;
                            border: 2px solid #000; 
                            padding:5px 10px 7px 10px;
                            background-color: #ecf7ff
                        }
                
                
                            .page-break {
                                break-after: page; /* Force page break after this element */
                            }
                            .avoid-break-inside {
                                break-inside: avoid; /* Avoid page breaks inside this element */
                            }
                
                        
                        .signature-format .col {
                            padding:0px
                        }
                        
                        .swf-e-signed{
                            font-size:.8rem;
                            font-weight:bold;
                            color:#555
                        }
                        .swf-swif{
                            font-size:1rem;
                            font-weight:bold;
                            margin-left:4px;
                            color:#c13127
                        }
                        .swf-sign{
                            display:flex;
                            align-items: center;
                        }
                        
                        .text-placeholder{
                            padding: 0px;
                            font-size:.75rem;
                            margin:0 0 1px 0;
                            text-align:right
                        }
                        .text-placeholder {
                            line-height: 1.2;
                        }
                        
                        .logo-placeholder {
                            margin:3px 0 0 0;
                            text-align:left;
                        }
                        
                        .name-placeholder {
                            line-height: 1.1;
                            font-size:1rem;
                            margin:5px 0;
                        }
                        
                        .hash-placeholder {
                            font-size:.8rem;
                            line-height:.82rem;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            white-space: pre-wrap;
                            word-break: break-all;
                            margin:0
                        }
                        .accused-table {
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .flex-row {
                            display: flex;
                            flex-direction: row;
                            align-items: center; /* Optional, for vertical centering */
                            margin-bottom: 10px; /* Spacing between rows */
                        }
                        
                        .flex-cell {
                            margin-right: 10px; /* Spacing between cells */
                        }
                        
                        .offence-table {
                            display: flex;
                            flex-direction: column;
                            width: 100%;
                        }
                        
                        .flex-header, .flex-row {
                            display: flex;
                            justify-content: space-between;
                        }
                        
                        .header-cell, .row-cell {
                            flex-grow: 1;
                            text-align: left;
                            padding: 5px; /* Adjust as needed */
                            border-bottom: 1px solid #ddd; /* For a line under each row */
                        }
                        
                        .flex-header {
                            background-color: #f9f9f9; /* Optional, for header background */
                            font-weight: bold; /* Optional, for header font styling */
                        }
                        
                        .sig-top{
                            padding:0 10px
                        }
                        
                        
                        
                        .swf-container{
                            border-radius: 5px;
                            max-width: 900px;
                            padding: 20px 40px;
                            margin: 30px 30px 30px 300px;
                            flex-grow: 1;
                        }
                        
                        .left-column {
                            box-shadow: 5px 0 5px -5px rgba(0, 0, 0, 0.2); /* Small shadow on the right */
                        }
                        
                        
                        .btn-xs {
                            padding: .25rem .5rem;
                            font-size: .875rem;
                            line-height: 1.2;
                            border-radius: .2rem;
                        }
                        
                        
                        #container-pdf{
                            width:700px;
                            padding:10px 50px 10px 20px;
                        }
                        
                        
                        
                        .form-control, .form-select{
                            border-radius:0;
                            color:#000;
                        }
                        
                        .rjsf #root {
                            /* max-width: 1280px; */
                            width: 100%;
                            margin: 0;
                            padding: 20px;
                            text-align: center;
                            background-color: #fff;
                            /* display:flex;
                            flex-wrap: wrap;
                            gap:30px; */
                            color: #000;
                            
                        
                            }
                        
                        
                        
                            .swf-flex-container fieldset {
                            /* max-width: 1280px; */
                            width: 100%;
                            margin: 0;
                            text-align: center;
                            background-color: #fff;
                            display:flex;
                            flex-wrap: wrap;
                            gap:10%;
                            color: #000;
                            }
                            .swf-flex-container fieldset .form-group{
                            /* max-width: 1280px; */
                            width: 45%;
                            }
                        
                        .sw-col-a{
                            flex: 0 0 200px; /* This sets the left column to a fixed width of 200px */
                            max-width: 200px;
                        }
                        
                        .sw-col-b{
                            flex-grow: 1; /* This allows the right column to take up the remaining space */
                            text-align: left; /* Aligns text to the left */
                        }
                        
                        
                            .flex-container {
                            /* display: flex; */
                            justify-content: space-between;
                            }
                            
                            .flex-item {
                            flex: 1 1 50%;
                            }
                        
                            .group-submission{
                            padding:15px;
                            }
                        
                            .swf-step{
                            padding:10px;
                            color:#000;
                            font-weight: bold;
                            height:100%
                            }
                        
                            .swf-step-1 {
                            padding: 10px;
                            color: #000;
                            font-weight: bold;
                            position: absolute;
                            right:0;
                            z-index:1000;
                            top: 0;
                            height: 100%;
                        }
                        
                        .accused-card .rjsf{
                            padding:0;
                        }
                        
                        .accused-index{
                            position:absolute; 
                            max-width:200px;
                            min-width:100px;
                            font-weight:bold;
                            font-size:.9rem;
                            background-color:#feeee1;
                            border:2px solid #f5c59e;
                            color:#333;
                            padding:5px 15px;
                            top:-10px; right:-15px
                        }
                        
                        .accused-card .rjsf #root{
                            padding:0;
                        }
                        
                        .add-charge .rjsf #root{
                            background-color:transparent;
                        
                        }
                        .add-charge .rjsf {
                            margin-bottom: 10px;
                            margin-top:20px;
                        }
                        
                        #root__title{
                            font-weight:bold;
                        }
                        #root__description{
                            font-size: 18px;
                        }
                
                    .accused-table td {
                        padding-right: 0;
                    }
                
                    .offence-table th {
                        padding: 3px 5px;
                    }
                
                    .offence-table td {
                        padding: 3px 5px;
                        border: 1px solid #555;
                    }
                
                    .swf-tbl,
                    #pdf-container .flex-header,
                    .pdf-head {
                        gap: 10px;
                    }
                    .swf-tbl {
                    }
                    .swf-tbl .flex-row,
                    .pdf-head .header-cell {
                        border-right: 1px solid #555;
                        margin-bottom: 0;
                        padding-bottom: 4px;
                    }
                
                    .swf-tbl .flex-row.last,
                    .pdf-head .header-cell.last {
                        border-right: transparent;
                    }
                
                    .swf-tbl .flex-row.first,
                    .header-cell.first {
                        border-left: 1px solid #555;
                        padding: 5px 5px 5px 10px;
                    }
                    .swf-tbl {
                        border-bottom: 1px solid #555;
                        border-right: 1px solid #555;
                    }
                
                    .pdf-head {
                        border-top: 1px solid #555;
                        border-bottom: 1px solid #555;
                        align-items: center;
                        justify-content: center;
                        border-right: 1px solid #555;
                    }
                
                    .header-cell {
                        border-bottom: transparent;
                    }
                    #regForm {
                        background-color: #f1f1f1;
                        margin: 50px auto;
                        width: 100%;
                        min-width: 300px;
                    }
                    .rjsf {
                    margin-bottom: 50px;
                    }
                    
                    .form-group {
                    text-align: left;
                    }
                    
                    
                    
                    .form-control {
                    margin-bottom: 20px;
                    }
                    
                    .progress-buttons {
                    text-align: right;
                    }
                    
                    .rjsf{
                    padding:10px 20px;
                    }
                    
                    .next-button {
                    margin-left: 5px;
                    }
                    
                    .control-label {
                    font-weight: bold;
                    }
                    
                    .accused-card {
                    margin-bottom: 30px;
                    }
                    
                    .add-charge fieldset {
                    width: 70%;
                    }
                    
                    .control-label {
                    color: #444;
                    }
                    
                    .submissions-container {
                    background-color: #f1f1f1;
                    padding: 50px 100px;
                    }
                    
                    .submission-card {
                    margin-bottom: 20px !important;
                    }
                    
                    .new-submission-btn {
                    margin-bottom: 50px;
                    }
                    
                    .submissions-title {
                    margin: 40px 0;
                    }
                    
                    .complainant-details {
                    width: 100%;
                    text-align: left;
                    }
                    
                    .complainant-details label {
                    font-weight: bold;
                    }
                    
                    .signature-frame {
                    border: 3px solid #444;
                    padding: 40px;
                    }
                    
                    </style>
                    </head>  <body> 
        `

    const htmlFooter = `
        </body></html>
    `

    const signatureHTML = `
    <style>
        .page-break {
            break-after: page; /* Force page break after this element */
        }
        .avoid-break-inside {
            break-inside: avoid; /* Avoid page breaks inside this element */
        }
    </style>
    <div
    class="avoid-break-inside"
    id="acnhor-sign"
    style="
    border: 10px solid rgb(238, 238, 238);
    background-color: rgb(249, 249, 249);
    padding: 20px;
    margin: 25px 0px 0px;
    ">
    <div
    class="avoid-break-inside m-0 mb-3 text-left fw-bold"
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
        style="background-color: rgb(236, 247, 255); padding:5px 5px; max-width:300px; border: 1px solid rgb(0,0,0)"
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
  `;

    const appendixA = `
    
        <div class="" style="margin:30px 0 0 0; font-size:15px; font-weight:bold; padding:30px 10px 10px 10px; text-align:center; border-top:1px solid #000" >
            Appendix - A
        </div>
        
        <div style="font-size:30px; font-weight:bold; padding:10px 10px 25px 10px; text-align:center" >
            Summary of Evidence
        </div>`;

    const printSummary = `
        <div
        id="acnhor-sign"
        style="
        padding: 20px;
        margin: 0;
        font-size: 10pt; line-height:14pt;"
        >
        ${summaryOfEidence}
        </div>
        `;

    console.log("Efiling Record: ", JSON.stringify(efilingRecord));

    try {
      const { html, submissionId, jsondata } = req.body;
      if (!html) {
        return res.status(400).send("No HTML content provided");
      }

      const htmlWithSignature = `
        <div>
            <div>${htmlHead}</div> 
            <div>${html}</div> 
            <div>${signatureHTML}</div>
            <div>${appendixA}</div>
            <div>${printSummary}</div>
            <div>${htmlFooter}</div> 
        </div>`;
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlWithSignature);
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        print: true,
        margin: {
          top: "7mm",
          right: "20mm",
          bottom: "20mm",
          left: "7mm",
        },
      });
      await browser.close();

      // File handling with try-catch
      if (!fs.existsSync(documentsPath)) {
        fs.mkdirSync(documentsPath, { recursive: true });
      }
      const pdfPath = path.join(
        documentsPath,
        `submission_${submissionId}.pdf`
      );
      fs.writeFileSync(pdfPath, pdf);

      // Form data and external API call
      const formData = new FormData();
      formData.append("fileupload", fs.createReadStream(pdfPath));
      formData.append("jsondata", JSON.stringify(efilingRecord));

      const response = await axios.post(externalApiUrl, formData, {
        headers: formData.getHeaders(),
      });

      console.log("Response from external API: ", response.data);
      await SubmissionModel.update(
        {
          status: "final",
          efilingId: response.data.efilingappcode,
          efilingResponse: JSON.stringify(response.data),
        },
        { where: { id: submissionId } }
      );
      res.json(response.data);
    } catch (err) {
      console.error("Error during PDF generation or external API call:", err);
      res.status(500).send("Error in processing PDF or API call");
    }
  } catch (err) {
    console.error("Error in convertWithPuppeteer function:", err);
    res.status(500).send("Internal Server Error");
  }

  // try {
  //     const { html, submissionId, jsondata} = req.body;
  //     // console.log(req.body);

  //     if (!html) {
  //         return res.status(400).send('No HTML content provided');
  //     }
  //     const htmlWithSignature = `<div><div>${html}</div> <div>${signatureHTML}</div><div>${appendixA} ${printSummary}</div></div>`
  //     const browser = await puppeteer.launch();
  //     const page = await browser.newPage();
  //     await page.setContent(htmlWithSignature);
  //     const pdf = await page.pdf({
  //         format: 'A4',
  //         printBackground: true,
  //         margin: {
  //             top: '7mm',
  //             right: '20mm',
  //             bottom: '20mm',
  //             left: '7mm'
  //         }
  //     });

  //     await browser.close();

  //     // Ensure the documents directory exists
  //     if (!fs.existsSync(documentsPath)){
  //         fs.mkdirSync(documentsPath, { recursive: true });
  //     }

  //     // Create a file path for the PDF
  //     const pdfPath = path.join(documentsPath, `submission_${submissionId}.pdf`);

  //     // Write the PDF to disk
  //     fs.writeFileSync(pdfPath, pdf);

  //     // Prepare the data for sending to the external API
  //     const formData = new FormData();
  //     formData.append('fileupload', fs.createReadStream(pdfPath));
  //     formData.append('jsondata', JSON.stringify(efilingRecord));
  //     // formData.append('jsondata', jsondata);
  //     // Send the PDF to the external API

  //     //*******************************PAUSED***************************** */
  //     const response = await axios.post(externalApiUrl, formData, {
  //         headers: formData.getHeaders()
  //     });

  //     console.log("-------------------------------");
  //     console.log(response.data);
  //     console.log("-------------------------------");
  //     // // Update the submission in the database
  //     await SubmissionModel.update(
  //         {
  //             status: 'final',
  //             efilingId: response.data.efilingappcode, // Save the efilingappcode
  //             efilingResponse: JSON.stringify(response.data) // Save the entire response
  //             // efilingResponse: JSON.stringify(response.data) // Save the entire response
  //         },
  //         { where: { id: submissionId } }
  //     );
  //     res.json(response.data);
  //     //************************************************************ */
  //     res.send();
  // } catch (error) {
  //     console.log(error);
  //     res.status(500).send('Error in processing: ' + error.message);
  // }
};


export const makePDFsendToEfiling = async (req, res) => {
  if (
    !req.body ||
    Object.keys(req.body).length === 0 ||
    !req.body.submission_id
  ) {
    return res.status(500).send("An error occurred");
  }
  try {
    console.log("Submission ID:  ", req.body.submission_id);
    // return res.send()
    const submissionWithDetails = await getSubmissionWithDetails(
      req.body.submission_id
    );
    if (!submissionWithDetails) {
      return res.status(400).send("error");
    }
    console.log("Submission Details");
    // Manipulate the response to remove previousDataValues
    const result = submissionWithDetails.get({ plain: true });
    // Delete the previousDataValues property if it exists
    delete result.previousDataValues;
    console.log(result);
    console.log(result?.user?.signatures[0]?.hash);

    function formatTime(date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();

      // Pad the hours, minutes and seconds with leading zeros, if required
      hours = hours.toString().padStart(2, "0");
      minutes = minutes.toString().padStart(2, "0");
      seconds = seconds.toString().padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;
    }

    const submissionDate = result?.createdAt.toISOString().split("T")[0];
    const submissionTime = formatTime(result?.createdAt);
    const signature = result?.user?.signatures?.[0]?.hash ?? "";
    const signFirstName = result?.complainant?.firstName ?? "";
    const signLastName = result?.complainant?.lastName ?? "";
    const signedName =
      (result?.complainant?.firstName ?? "") +
      " " +
      (result?.complainant?.lastName ?? "");
    const complainantRank = result?.complainant?.rank ?? "";
    const complainantRegNum = result?.complainant?.regNum ?? "";

    const summaryOfEidence = result?.summaryOfEvidence ?? "";

    console.log("============================================");
    //Build the efiling submission

    let docId;
    let courtOffice;
    let description = submissionWithDetails?.complainant?.courtDistrict || "";

    if (submissionWithDetails?.complainant?.courtDistrict) {
      switch (submissionWithDetails.complainant.courtDistrict) {
        case "District Court Complaint with Oath":
          docId = "dcrim002";
        case "District Court Complaint without Oath":
          docId = "dcrim003";
        case "High Court Complaint without Oath":
          docId = "hcrim043";
        case "High Court Complaint with Oath":
          docId = "hcrim044";
        case "Children Complaint":
          docId = "cc001";
        default:
          docId = "-";
      }
    }

    let courtoffice;
    if (description.includes("North")) {
      courtoffice = "pos";
    } else if (description.includes("South")) {
      courtoffice = "sfo";
    } else if (description.includes("Tobago")) {
      courtoffice = "tgo";
    } else {
      courtoffice = "pos";
    }

    const efilingRecord = {
      swftransid: "swif-" + req.body.submission_id,
      email: submissionWithDetails.user.email,
      userid: submissionWithDetails.user.id,
      username: "",
      court: "hcrim", //this has to be updated
      courtoffice: courtoffice,
      // court: "hcrim", //this has to be updated
      // courtoffice: courtoffice,
      type: 1,
      casenotes: "-",
      filingid: submissionWithDetails.type || 1,
      returnurl: "http://swif.ttlawcourts.org/efiling/subs",
      submissiondata: JSON.stringify(result) || "-",
      // "doc_id": docId,
      // "doc_type":1,
      // "court": submissionWithDetails.complainant.court,
      // "signatureobject": submissionWithDetails?.signatures || []
    };

    console.log(efilingRecord);



    const htmlHead = `
                <html>  <head>    <style>    body {
                    font-family: 'Arial', sans-serif;  line-height:1.2rem;
                }
                *{font-size:9pt; line-height:1.2rem}
                        
                        .signature-format {
                            width: 300px;
                            border: 2px solid #000; 
                            padding:5px 10px 7px 10px;
                            background-color: #ecf7ff;
                        }
                
                
                            .page-break {
                                break-after: page; /* Force page break after this element */
                            }
                            .avoid-break-inside {
                                break-inside: avoid; /* Avoid page breaks inside this element */
                            }
                
                        
                        .signature-format .col {
                            padding:0px
                        }
                        
                        .swf-e-signed{
                            font-size:.8rem;
                            font-weight:bold;
                            color:#555
                        }
                        .swf-swif{
                            font-size:1rem;
                            font-weight:bold;
                            margin-left:4px;
                            color:#c13127
                        }
                        .swf-sign{
                            display:flex;
                            align-items: center;
                        }
                        
                        .text-placeholder{
                            padding: 0px;
                            font-size:.75rem;
                            margin:0 0 1px 0;
                            text-align:right
                        }
                        .text-placeholder {
                            line-height: 1.2;
                        }
                        
                        .logo-placeholder {
                            margin:3px 0 0 0;
                            text-align:left;
                        }
                        
                        .name-placeholder {
                            line-height: 1.1;
                            font-size:1rem;
                            margin:5px 0;
                        }
                        
                        .hash-placeholder {
                            font-size:.8rem;
                            line-height:.82rem;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            white-space: pre-wrap;
                            word-break: break-all;
                            margin:0
                        }
                        .accused-table {
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .flex-row {
                            display: flex;
                            flex-direction: row;
                            align-items: center; /* Optional, for vertical centering */
                            margin-bottom: 10px; /* Spacing between rows */
                        }
                        
                        .flex-cell {
                            margin-right: 10px; /* Spacing between cells */
                        }
                        
                        .offence-table {
                            display: flex;
                            flex-direction: column;
                            width: 100%;
                        }
                        
                        .flex-header, .flex-row {
                            display: flex;
                            justify-content: space-between;
                        }
                        
                        .header-cell, .row-cell {
                            flex-grow: 1;
                            text-align: left;
                            padding: 5px; /* Adjust as needed */
                            border-bottom: 1px solid #ddd; /* For a line under each row */
                        }
                        
                        .flex-header {
                            background-color: #f9f9f9; /* Optional, for header background */
                            font-weight: bold; /* Optional, for header font styling */
                        }
                        
                        .sig-top{
                            padding:0 10px
                        }
                        
                        
                        
                        .swf-container{
                            border-radius: 5px;
                            max-width: 900px;
                            padding: 20px 40px;
                            margin: 30px 30px 30px 300px;
                            flex-grow: 1;
                        }
                        
                        .left-column {
                            box-shadow: 5px 0 5px -5px rgba(0, 0, 0, 0.2); /* Small shadow on the right */
                        }
                        
                        
                        .btn-xs {
                            padding: .25rem .5rem;
                            font-size: .875rem;
                            line-height: 1.2;
                            border-radius: .2rem;
                        }
                        
                        
                        #container-pdf{
                            width:700px;
                            padding:10px 50px 10px 20px;
                        }
                        
                        
                        
                        .form-control, .form-select{
                            border-radius:0;
                            color:#000;
                        }
                        
                        .rjsf #root {
                            /* max-width: 1280px; */
                            width: 100%;
                            margin: 0;
                            padding: 20px;
                            text-align: center;
                            background-color: #fff;
                            /* display:flex;
                            flex-wrap: wrap;
                            gap:30px; */
                            color: #000;
                            
                        
                            }
                        
                        
                        
                            .swf-flex-container fieldset {
                            /* max-width: 1280px; */
                            width: 100%;
                            margin: 0;
                            text-align: center;
                            background-color: #fff;
                            display:flex;
                            flex-wrap: wrap;
                            gap:10%;
                            color: #000;
                            }
                            .swf-flex-container fieldset .form-group{
                            /* max-width: 1280px; */
                            width: 45%;
                            }
                        
                        .sw-col-a{
                            flex: 0 0 200px; /* This sets the left column to a fixed width of 200px */
                            max-width: 200px;
                        }
                        
                        .sw-col-b{
                            flex-grow: 1; /* This allows the right column to take up the remaining space */
                            text-align: left; /* Aligns text to the left */
                        }
                        
                        
                            .flex-container {
                            /* display: flex; */
                            justify-content: space-between;
                            }
                            
                            .flex-item {
                            flex: 1 1 50%;
                            }
                        
                            .group-submission{
                            padding:15px;
                            }
                        
                            .swf-step{
                            padding:10px;
                            color:#000;
                            font-weight: bold;
                            height:100%
                            }
                        
                            .swf-step-1 {
                            padding: 10px;
                            color: #000;
                            font-weight: bold;
                            position: absolute;
                            right:0;
                            z-index:1000;
                            top: 0;
                            height: 100%;
                        }
                        
                        .accused-card .rjsf{
                            padding:0;
                        }
                        
                        .accused-index{
                            position:absolute; 
                            max-width:200px;
                            min-width:100px;
                            font-weight:bold;
                            font-size:.9rem;
                            background-color:#feeee1;
                            border:2px solid #f5c59e;
                            color:#333;
                            padding:5px 15px;
                            top:-10px; right:-15px
                        }
                        
                        .accused-card .rjsf #root{
                            padding:0;
                        }
                        
                        .add-charge .rjsf #root{
                            background-color:transparent;
                        
                        }
                        .add-charge .rjsf {
                            margin-bottom: 10px;
                            margin-top:20px;
                        }
                        
                        #root__title{
                            font-weight:bold;
                        }
                        #root__description{
                            font-size: 18px;
                        }
                
                    .accused-table td {
                        padding-right: 0;
                    }
                
                    .offence-table th {
                        padding: 3px 5px;
                    }
                
                    .offence-table td {
                        padding: 3px 5px;
                        border: 1px solid #555;
                    }
                
                    .swf-tbl,
                    #pdf-container .flex-header,
                    .pdf-head {
                        gap: 10px;
                    }
                    .swf-tbl {
                    }
                    .swf-tbl .flex-row,
                    .pdf-head .header-cell {
                        border-right: 1px solid #555;
                        margin-bottom: 0;
                        padding-bottom: 4px;
                    }
                
                    .swf-tbl .flex-row.last,
                    .pdf-head .header-cell.last {
                        border-right: transparent;
                    }
                
                    .swf-tbl .flex-row.first,
                    .header-cell.first {
                        border-left: 1px solid #555;
                        padding: 5px 5px 5px 10px;
                    }
                    .swf-tbl {
                        border-bottom: 1px solid #555;
                        border-right: 1px solid #555;
                    }
                
                    .pdf-head {
                        border-top: 1px solid #555;
                        border-bottom: 1px solid #555;
                        align-items: center;
                        justify-content: center;
                        border-right: 1px solid #555;
                    }
                
                    .header-cell {
                        border-bottom: transparent;
                    }
                    #regForm {
                        background-color: #f1f1f1;
                        margin: 50px auto;
                        width: 100%;
                        min-width: 300px;
                    }
                    .rjsf {
                    margin-bottom: 50px;
                    }
                    
                    .form-group {
                    text-align: left;
                    }
                    
                    
                    
                    .form-control {
                    margin-bottom: 20px;
                    }
                    
                    .progress-buttons {
                    text-align: right;
                    }
                    
                    .rjsf{
                    padding:10px 20px;
                    }
                    
                    .next-button {
                    margin-left: 5px;
                    }
                    
                    .control-label {
                    font-weight: bold;
                    }
                    
                    .accused-card {
                    margin-bottom: 30px;
                    }
                    
                    .add-charge fieldset {
                    width: 70%;
                    }
                    
                    .control-label {
                    color: #444;
                    }
                    
                    .submissions-container {
                    background-color: #f1f1f1;
                    padding: 50px 100px;
                    }
                    
                    .submission-card {
                    margin-bottom: 20px !important;
                    }
                    
                    .new-submission-btn {
                    margin-bottom: 50px;
                    }
                    
                    .submissions-title {
                    margin: 40px 0;
                    }
                    
                    .complainant-details {
                    width: 100%;
                    text-align: left;
                    }
                    
                    .complainant-details label {
                    font-weight: bold;
                    }
                    
                    .signature-frame {
                    border: 3px solid #444;
                    padding: 40px;
                    }
                    
                    </style>
                    </head>  <body> 
        `

    const htmlFooter = `
        </body></html>
    `

    const signatureHTML = `
    <style>
        .page-break {
            break-after: page; /* Force page break after this element */
        }
        .avoid-break-inside {
            break-inside: avoid; /* Avoid page breaks inside this element */
        }
    </style>
    <div
    class="avoid-break-inside"
    id="acnhor-sign"
    style="
    border: 10px solid rgb(238, 238, 238);
    background-color: rgb(249, 249, 249);
    padding: 20px;
    margin: 25px 0px 0px;
    ">
    <div
    class="avoid-break-inside m-0 mb-3 text-left fw-bold"
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
        style="background-color: rgb(236, 247, 255); padding:5px 5px; max-width:300px; border: 1px solid rgb(0,0,0)"
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
  `;

    const appendixA = `
    
        <div class="" style="margin:30px 0 0 0; font-size:15px; font-weight:bold; padding:30px 10px 10px 10px; text-align:center; border-top:1px solid #000" >
            Appendix - A
        </div>
        
        <div style="font-size:30px; font-weight:bold; padding:10px 10px 25px 10px; text-align:center" >
            Summary of Evidence
        </div>`;

    const printSummary = `
        <div
        id="acnhor-sign"
        style="
        padding: 20px;
        margin: 0;
        font-size: 10pt; line-height:14pt;"
        >
        ${summaryOfEidence}
        </div>
        `;

    console.log("Efiling Record: ", JSON.stringify(efilingRecord));

    try {
      const { html, submission_id, email, jsondata } = req.body;
      if (!html) {
        return res.status(400).send("No HTML content provided");
      }

      const htmlWithSignature = `
        <div>
            <div>${htmlHead}</div> 
            <div>${html}</div> 
            <div>${signatureHTML}</div>
            <div>${appendixA}</div>
            <div>${printSummary}</div>
            <div>${htmlFooter}</div> 
        </div>`;
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlWithSignature);
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        print: true,
        margin: {
          top: "7mm",
          right: "20mm",
          bottom: "20mm",
          left: "7mm",
        },
      });
      await browser.close();

      // File handling with try-catch
      if (!fs.existsSync(documentsPath)) {
        fs.mkdirSync(documentsPath, { recursive: true });
      }
      const pdfPath = path.join(
        documentsPath,
        `submission_${submission_id}.pdf`
      );
      fs.writeFileSync(pdfPath, pdf);

      // Form data and external API call
      const formData = new FormData();
      formData.append("fileupload", fs.createReadStream(pdfPath));
      formData.append("jsondata", JSON.stringify(efilingRecord));

      const response = await axios.post(externalApiUrl, formData, {
        headers: formData.getHeaders(),
      });

      console.log("Response from external API: ", response.data);
      await SubmissionModel.update(
        {
          status: "final",
          efilingId: response.data.efilingappcode,
          efilingResponse: JSON.stringify(response.data),
        },
        { where: { id: req.body.submission_id } }
      );
      return({"success": true })
    } catch (err) {
      console.error("Error during PDF generation or external API call:", err);
      return({"success": false})
    }
  } catch (err) {
    console.error("Error in convertWithPuppeteer function:", err);
    return({"success": false})
  }
}
