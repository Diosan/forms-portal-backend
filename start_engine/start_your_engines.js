import bcrypt from "bcrypt";
import {
  db,
  UserModel,
  SubmissionModel, ChargeCodeModel,
  AdminUserModel,
} from "../models/index.js";

import fs from 'fs';
import csvParser from 'csv-parser';
import formidable from 'formidable';
import path from 'path';




// Define a function to fetch and format the data
export const getChargeCodes = async () => {
  try {
    const chargeCodes = await ChargeCodeModel.findAll({
      attributes: ['id', 'name', 'section', 'ICCS', 'category'],
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    const groupedData = {};
    
    // Group the data by category
    chargeCodes.forEach(chargeCode => {
      const { category } = chargeCode;
      if (!groupedData[category]) {
        groupedData[category] = [];
      }
      groupedData[category].push(chargeCode);
    });

    return groupedData;
  } catch (error) {
    console.error('Error fetching charge codes:', error);
    throw error;
    
  }
};














//UPLOAD THE CHARGE CODES
export const uploadChargeCodes = async (req) => {
    console.log("getting the file")
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    const errors = [];

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log("Error parsing form: ", err);
        reject(err);
        return;
      }

      const uploadedFile = files.file;
      if (!uploadedFile) {
        console.log("No file uploaded");
        reject(new Error("No file uploaded."));
        return;
      }

      const fileName = uploadedFile.originalFilename;
      const fileExtension = path.extname(fileName).toLowerCase();

      if (fileExtension !== ".csv") {
        console.log("File is not a CSV");
        reject(new Error("Only CSV files are allowed!"));
        return;
      }

      const csvFile = uploadedFile.filepath;

      fs.createReadStream(csvFile)
        .pipe(csvParser())
        .on("data", async (row) => {
          try {
            const newChargeCode = {
              name: row.name,
              ICCS: row.iccs,
              category: row.category,
              section: row.section,
              nid: row.nid
            };
            console.log(newChargeCode);
            // return
            await ChargeCodeModel.create(newChargeCode);
          } catch (error) {
            console.log("Error adding to database: ", error);
            errors.push({ row, error: error.message });
          }
        })
        .on("end", async () => {
          if (errors.length > 0) {
            // Handle errors (e.g., create an error file or log them)
            resolve({
              message: "Upload completed with errors",
              errorDetails: errors,
            });
          } else {
            resolve({ message: "Upload complete" });
          }
        });
    });
  });
};









//create superadmin
export const createSuperAdmins = async () => {
  try {
    // Check if a superadmin user already exists
    const superadminExists = await AdminUserModel.findOne({
      where: { username: "hhernandez@ttlawcourts.org" },
    });
    if (superadminExists) {
      console.log("Superadmin user already exists.");
      return;
    }
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(process.env.SA, saltRounds);
    // Create a new superadmin user
    const superadmin = await AdminUserModel.create({
      email: "hhernandez@ttlawcourts.org",
      username: "swf-noreply@ttlawcourts.org",
      password: hashedPassword,
      role: "superadmin",
      fullname: "Admin",
      firstName: "SA",
      middleName: "",
      lastName: "SA",
      address: "",
      phone: "8680000000",
    });
    console.log("Superadmin user created successfully.");
  } catch (error) {
    console.error("Error creating superadmin user:", error);
  }
};

//generate key
export const generateKey = async () => {
  //USED TO GENERATE A NEW SECRET (uncomment when needed)
  // const crypto = require('crypto');
  // const secret = crypto.randomBytes(1024).toString('hex');
  // console.log(secret);
  //-----------------------------------------------------
};

export const uploadDefaultDb = async () => {
    filePath
};

// Function to process the CSV file
export const uploadUsers = async (filePath) => {
  console.log("Uploading", filePath);

  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    const errors = [];
    try {
      form.parse(filePath, (err, fields, files) => {
        if (err) {
          console.log("Error");
          reject(err);
          return;
        }

        // Check if a file was uploaded and get its details
        const uploadedFile = files.file;
        if (!uploadedFile) {
          console.log("No file uploaded");
          reject(new Error("No file uploaded."));
          return;
        }

        const fileName = uploadedFile.originalFilename;
        const fileExtension = path.extname(fileName).toLowerCase();

        // Check if the file extension is .csv
        if (fileExtension !== ".csv") {
          console.log("not a csv file");
          reject(new Error("Only CSV files are allowed!"));
          return;
        }

        const csvFile = files.file.filepath;

        fs.createReadStream(csvFile)
          .pipe(csvParser())
          .on("data", (row) => {
            if (!validateEmailDomain(row.email)) {
              console.log("Invalid Domain");
              errors.push({ user: row, error: "Invalid domain" });
              return;
            }

            const user = {
              username: row.email, // Username is the email
              ...row,
            };
            // console.log(user)

            addUserToDatabase(user, (error) => {
              if (error) {
                console.log(error);
                errors.push({ user, error });
                // console.log(error)
              }
            });
          })
          .on("end", () => {
            if (errors.length > 0) {
              const errorFilePath = createErrorCSV(errors);
              console.log(errors);
              resolve({
                message: "Upload completed with errors",
                errorFilePath,
              });
            } else {
              resolve({ message: "Upload complete" });
            }
          });
      });
    } catch (errors) {
      console.log(errors);
    }
  });
}
// Function to validate email domain
function validateEmailDomain(email) {
  // Check if email is not undefined and is a truthy value
  if (email) {
    // Convert to string and trim whitespace
    let emailStr = String(email).trim();
    console.log(emailStr);

    // Validate the email format
    // return emailStr.endsWith('@ttps.gov.tt');
    return (
      emailStr.endsWith("@ttps.gov.tt") || emailStr.endsWith("@ttlawcourts.org")
    );
  } else {
    console.error("Invalid or undefined email provided");
    return false;
  }
}
// Function to add a user to the database
function addUserToDatabase(user, callback) {
  UserModel.create(user)
    .then(() => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + user);
      callback(null);
    })
    .catch((err) => {
      callback(err);
    });
}

// Function to create an error CSV
function createErrorCSV(errors) {
    console.log("Uploading the charges codes csv");

  // The directory where the error file will be stored
  const errorDirectory = path.join(__dirname, "public/errors");
  console.log(errorDirectory);
  // Ensure the directory exists, create it if it doesn't
  if (!fs.existsSync(errorDirectory)) {
    fs.mkdirSync(errorDirectory, { recursive: true });
  }
  // Create a unique filename using a timestamp (up to seconds)
  const timestamp = new Date()
    .toISOString()
    .replace(/:\d{2}\.\d{3}Z$/, "")
    .replace(/[-T:]/g, "");
  const filename = `errors_${timestamp}.csv`;
  const errorFilePath = path.join(errorDirectory, filename);
  const errorFile = fs.createWriteStream(errorFilePath);
  errorFile.write("Username,Error\n");
  errors.forEach(({ user, error }) => {
    errorFile.write(`${user.username},${error}\n`);
  });

  errorFile.end();

  // Return the publicly accessible URL path
  return `/public/errors/${filename}`;
}
