// Import necessary modules
import formidable from 'formidable';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { db, UserModel } from "../models/index.js"; // Importing your existing db and UserModel
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




// Function to process the CSV file
export function uploadUsers(filePath) {

    console.log('Uploading', filePath);
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();
        const errors = [];
        try{
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
                    reject(new Error('No file uploaded.'));
                    return;
                }
    
                const fileName = uploadedFile.originalFilename;
                const fileExtension = path.extname(fileName).toLowerCase();
    
                // Check if the file extension is .csv
                if (fileExtension !== '.csv') {
                    console.log("not a csv file")
                    reject(new Error('Only CSV files are allowed!'));
                    return;
                }
    
                
    
                const csvFile = files.file.filepath;
    
                
                fs.createReadStream(csvFile)
                    .pipe(csvParser())
                    .on('data', (row) => {
                        if (!validateEmailDomain(row.email)) {
                            console.log("Invalid Domain");
                            errors.push({ user: row, error: 'Invalid domain' });
                            return;
                        }
    
                        const user = {
                            username: row.email, // Username is the email
                            ...row
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
                    .on('end', () => {
                        if (errors.length > 0) {
                            const errorFilePath = createErrorCSV(errors);
                            console.log(errors);
                            resolve({ message: 'Upload completed with errors', errorFilePath });
                        } else {
                            resolve({ message: 'Upload complete' });
                        }
                    });
            });
        }catch(errors){
            console.log(errors);
        }

        
    });
}




export const bulkUploadUsers = async (req, res) => {
    try{
        uploadUsers(req)
        .then(result => {
            if (result.errorFilePath) {
                console.log(result)
                res.status(200).json({
                    message: result.message,
                    errorFile: result.errorFilePath
                });
            } else {
                res.status(200).json({ message: result.message });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
    }catch(errors){
        console.log(errors);
    }
};




// Function to validate email domain
function validateEmailDomain(email) {
    // Check if email is not undefined and is a truthy value
    if (email) {
        // Convert to string and trim whitespace
        let emailStr = String(email).trim();
        console.log(emailStr);

        // Validate the email format
        return emailStr.endsWith('@ttps.gov.tt');
    } else {
        console.error('Invalid or undefined email provided');
        return false;
    }
}

// Function to add a user to the database
function addUserToDatabase(user, callback) {
    UserModel.create(user).then(() => {
        callback(null);
    }).catch((err) => {
        callback(err);
    });
}

// Function to create an error CSV
function createErrorCSV(errors) {
    // The directory where the error file will be stored
    const errorDirectory = path.join(__dirname, '../public/errors');

    // Ensure the directory exists, create it if it doesn't
    if (!fs.existsSync(errorDirectory)) {
        fs.mkdirSync(errorDirectory, { recursive: true });
    }

    // Create a unique filename using a timestamp (up to seconds)
    const timestamp = new Date().toISOString().replace(/:\d{2}\.\d{3}Z$/, '').replace(/[-T:]/g, '');
    const filename = `errors_${timestamp}.csv`;
    const errorFilePath = path.join(errorDirectory, filename);

    const errorFile = fs.createWriteStream(errorFilePath);

    errorFile.write('Username,Error\n');
    errors.forEach(({ user, error }) => {
        errorFile.write(`${user.username},${error}\n`);
    });

    errorFile.end();

    // Return the publicly accessible URL path
    return `/public/errors/${filename}`;
}

