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
    console.log("uploading the file");
    // return


    try{
        uploadUsers(req)
        .then(result => {
            if (result.errorFilePath) {
                console.log("ERROR UPLOADING A")
                res.status(200).json({
                    message: result.message,
                    errorFile: result.errorFilePath
                });
            } else {
                console.log("ERROR UPLOADING B")
                // res.status(200).json({ message: result.message });
            }
        })
        .catch(error => {
            console.log("ERROR UPLOADING C")
            res.status(500).json({ error: error.message });
        });
    }catch(errors){
        console.log("ERROR UPLOADING D >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        // console.log(errors);
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


// This function will handle the file upload and the CSV parsing
export const uploadCsvAndCreateUsers = (req) => {
    return new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      console.log('Started file parsing');
  
      form.parse(req, (err, fields, files) => {
        console.log('>>>> 1');
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        console.log('>>>> 1');
      
        console.log('Form parsed. Fields:', fields, 'Files:', files);
      
        if (!files.file) {
          console.error('No file found in the form data.');
          reject(new Error('No file uploaded.'));
          return;
        }
  
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        console.log('Processing file:', file.filepath);
  
        const results = [];
  
        fs.createReadStream(file.filepath)
          .pipe(csvParser())
          .on('data', (row) => {
            console.log('Row received:', row);
            results.push(row);
          })
          .on('end', () => {
            console.log('CSV file has been read, number of records:', results.length);
            const createUserPromises = results.map((user) => {
              return UserModel.create(user).then((createdUser) => {
                console.log('User created:', createdUser);
                return createdUser;
              }).catch((error) => {
                console.error('Error creating user:', error);
                return { error: error.message };
              });
            });
  
            Promise.allSettled(createUserPromises)
              .then((results) => {
                const errors = results.filter(result => result.status === 'rejected');
                console.log('User creation results:', results);
                if (errors.length > 0) {
                  console.error('Some users could not be created:', errors);
                  reject(errors);
                } else {
                  console.log('All users have been created successfully.');
                  resolve('All users have been created successfully.');
                }
              })
              .catch((error) => {
                console.error('An error occurred while creating users:', error);
                reject(error);
              });
          })
          .on('error', (error) => {
            console.error('Error reading the CSV file:', error);
            reject(error);
          });
      });
    });
  };



 
 
  export const csvTemp = (req, res) => {
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields, files) => {
          if (err) {
              res.status(500).json({ error: err.message });
              return;
          }
  
          const csvFilePath = files.file.filepath;
          const results = [];
  
          fs.createReadStream(csvFilePath)
              .pipe(csvParser())
              .on('data', (data) => results.push(data))
              .on('end', () => {
                  // Process the parsed data
                  // Here you can use Sequelize to save data to your database
                  // For example, assuming each row in your CSV is a user:
                  results.forEach(async (row) => {
                      try {
                          await UserModel.create(row);
                      } catch (dbError) {
                          console.error(dbError);
                      }
                  });
  
                  res.json(results);
              });
      });
  };

  

  





