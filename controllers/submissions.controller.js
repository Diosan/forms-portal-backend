import { db, ErrorLogModel, 
  SubmissionModel, 
  ComplainantModel, 
  UserModel, 
  AccusedModel,
  ChargesModel,
  SignatureModel,
  ChargeCodeModel,
  VerifierModel,

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

const APP_DOMAIN = process.env.APP_DOMAIN;
const SWF_LOGO = process.env.SWF_LOGO;
const SWF_EMAIL = process.env.SWF_EMAIL;


const ErrorLog = ErrorLogModel;

export const verifiers = async (req, res) => {
  let returned_verifiers = await VerifierModel.findAll(
    {raw: true}
  );
  return res.status(201).json({
    verifiers: returned_verifiers
  })
}

export const chargeCodes = async (req, res) => {

  let charge_codes = await ChargeCodeModel.findAll();
  return res.status(201).json({
    charge_codes: charge_codes
  });
  
}

export const sendSignRequest = async (req, res) => {

  console.log('\n\n\n Sign Request Request Body: ', req.body);


  console.log('\n\n\n Sign Request Request Body: ', req.body);

  const mailer = new SubmissionMailer();
  let complainant = await ComplainantModel.findOne(
    {
      where: {submissionId: req.body.submission_id},
      raw: true
    }
  );

  console.log('\n\n\n\n Complainant: ', complainant);

  let complainantUser = await UserModel.findOne(
    {
      where: {email: complainant.email},
      raw: true
    }
  );

  // let verifierUser = await UserModel.findByPk(
  //   complainantUser.verifierId,
  //   {raw: true}
  // );
  // let email = verifierUser.email;
  // let name = verifierUser.firstName;

  let verifierUser = await UserModel.findOne({
    where: {
      email: req.body.commisioned_email
    },
    raw: true
  });

  // let verifierUser = await UserModel.findByPk(
  //   complainantUser.verifierId,
  //   {raw: true}
  // );
  // let email = verifierUser.email;
  // let name = verifierUser.firstName;

  
  let email = verifierUser.email;
  let name = verifierUser.firstName;


  mailer.signatureRequestEmail(
    req.body.submission_id, 
    email,
    name
  );
  res.status(201).json({
    outcome: 'success'
  })
}

export const sendOTP = async (req, res) => {

  const totp = new SignOTPGenerator();

  totp.generateOTP(req.body.submission_id, req.body.email, req.body.name)
  .then(() => console.log('OTP sent to user email.'))
  .catch(error => console.error('Error generating or sending OTP:', error));

  return res.status(201).json({
    outcome: 'success', 
    message: "Successfully logged in: OTP send to " + req.body.email,
    email: req.body.email
  })

  // return res.status.json(201)({
  //   outcome: 'failure'
  // })

}


export const sendVerifyOTP = async (req, res) => {

  let complainant = await ComplainantModel.findOne(
    {
      where: {submissionId: req.body.submission_id},
      raw: true
    }
  );

  console.log('\n\n\n\n Complainant: ', complainant);

  let complainantUser = await UserModel.findOne(
    {
      where: {email: complainant.email},
      raw: true
    }
  );
  let verifierUser = await UserModel.findByPk(
    complainantUser.verifierId,
    {raw: true}
  )
  let email = verifierUser.email;
  let name = verifierUser.firstName;

  const totp = new SignOTPGenerator();

  totp.generateOTP(req.body.submission_id, email, name)
  .then(() => console.log('OTP sent to user email.'))
  .catch(error => console.error('Error generating or sending OTP:', error));

  return res.status(201).json({
    outcome: 'success', 
    message: "Successfully logged in: OTP send to " + email,
    email: email
  })

  // return res.status.json(201)({
  //   outcome: 'failure'
  // })

}


export const verifyOTP = async (req, res) => {
  // console.log('\n\n Request body: ', req.body);
  // console.log('\n\n');

  const totp = new SignOTPGenerator();
  let verified = await totp.verifyOTP(req.body.email, req.body.otp);
  
  // console.log('\n\n\n verification result: ', verified);

  if(verified) {
    return res.status(201).json({outcome: 'success'});
  } else {
    return res.status(201).json({outcome: 'failure'});
  }

}


export const complainantSign = async (req, res) => {

  let signatures = new Signatures;

  console.log('\n\n\n Request body: ', req.body);

  let email = req.body.email;
  let submission_id = req.body.submission_id;

  // console.log('Email: ', email);

  let signature = await signatures.complainantSubmissionSign(
    email=email,
    submission_id=submission_id
  );

  console.log('\n\n\n Signature from Signature Class: ', signature);
  
  res.status(201).json(signature);

  // res.status(201).json({ submission_hash: submissionHash});

  // res.status(201).json({ submission_hash: 'abcdefghijklmnopqrstuvwyz'});

}



export const verifierSign = async (req, res) => {

  let signatures = new Signatures;

  console.log('\n\n\n Request body: ', req.body);

  let complainant_email = req.body.email;
  let submission_id = req.body.submission_id;

  let complainantUser = await UserModel.findOne(
    {
      where: {email: complainant_email},
      raw: true
    }
  );
  let verifierUser = await UserModel.findByPk(
    complainantUser.verifierId,
    {raw: true}
  );

  let email = verifierUser.email;

  // console.log('Email: ', email);

  let signature = await signatures.verifierSubmissionSign(
    email=email,
    submission_id=submission_id
  );

  console.log('\n\n\n Signature from Signature Class: ', signature);
  
  res.status(201).json(signature);

  // res.status(201).json({ submission_hash: submissionHash});

  // res.status(201).json({ submission_hash: 'abcdefghijklmnopqrstuvwyz'});

}


export const submissionSignature = async (req, res) => {


  console.log('\n\n\n Request body: ', req.body)

  let user = await UserModel.findByPk(
    req.body.userId,
    { raw: true }
  );

  console.log('\n\n\n user: ', user);  

  let signature = await SignatureModel.findOne({
    where: {
      content_id: req.body.submission_id,
      userId: req.body.userId
    },
    raw: true
  });

  console.log('\n\n\n signature: ', signature);

  res.status(201).json({
    signature: signature,
    user: user
  });

  // res.status(201).json({});

}


export const submissionVerification = async (req, res) => {


  console.log('\n\n\n Request body: ', req.body)

  let user = await UserModel.findByPk(
    req.body.userId,
    { raw: true }
  );

  console.log('\n\n\n user: ', user);  

  let signature = await SignatureModel.findOne({
    where: {
      type: 'verification',
      content_id: req.body.submission_id,
      userId: req.body.userId
    },
    raw: true
  });

  console.log('\n\n\n signature: ', signature);

  res.status(201).json({
    signature: signature,
    user: user
  });

  // res.status(201).json({});

}


export const findAll = (req, res) => {

    console.log(req.user.id)

    SubmissionModel.findAndCountAll({where:{"userId": req.user.id}})
    .then(data => {
        console.log('Submission. Fetched: ', data.rows[data.rows.length - 1].dataValues.id);
        res.status(201).json({
            outcome: 'success',
            submissions: data
        });
    })
    .catch(error => {
      console.log(error)
        res.status(201).json({
            outcome: 'error', 
            error: error
          });
    });

}

//  

export const findOne = async (req, res) => {


  // .then(data => {
  //   // console.log('Fetched Submission Record: ', data)      
  // })
  // .catch(err => {
  //   // console.log('Error fetching Submission with Id : ' + id, err)
  // });

  // let complainants = await Complainant.findAll({
  //   where: {
  //     submissionId: id
  //   }
  // })
  // .then(data => {        
  //   console.log('Fetched Submission Record: ', data)
  // });
  // .catch(complaint_err => {
  //     console.log('Error fetching Complainant records with submissionId : ' + id, err)
  // });

  const id = req.params.id;

  let submission = await SubmissionModel.findByPk(id)

  let complainant = await ComplainantModel.findOne({
    where: {
      submissionId: id
    }
  })

  let accuseds = await AccusedModel.findAll({
    where: {
      submissionId: id
    }
  })


  res.status(200).json({
    submission: submission,
    complainant: complainant,
    accuseds: accuseds
  })

};

export const authenticateUser = async (req, res) => {
  console.log(req.body)
  // Validate request
  if(
     !req.body.email || !req.body.firebase_user_id || !req.body.fullname
    )
  {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const data ={
    firebaseId: req.body.firebase_user_id,
    username: req.body.email?req.body.email:"",
    fullname: req.body.fullname?req.body.fullname:"",
    email: req.body.email?req.body.email:"", 
    active: 0,
    status: 0,
    role: 0,
  }
  //check if user exist
  //if user doesn't exists create new user
    User.findOrCreate({
      where: {
        firebaseId: data.firebaseId
      },
      defaults: {
        // firebaseId: user.firebase_id,
        // password: "0nMym@rk!@",
        username: data.email,
        email: data.email,
        fullname: data.fullname,
        // active: user.active,
        // status: user.status,
        // role: user.role,
      }
    }).then(([user, created]) => {
      if (created) {
        res.status(201).json({
          message: 'User created',
          user: user
        });
      } else {
          //if user does exist, update logged in status
          user.update(data).then(() => {
            res.status(200).json({
              message: 'User updated',
              user: user
            });
          })
          .catch(err => {
            res.status(500).send({
              message: "Error updating User with id=" + user.firebaseId
            });
          });
        // res.status(200).json({
        //   message: 'User found',
        //   user: user
        // });
      }
    });
  

  


 
        


       

};

export const saveComplainant = async (req, res) => {

    console.log('\n\n\n attempting to save complainant \n\n\n');  

    let transporter = nodemailer.createTransport(mailConfig);

    const submission = SubmissionModel.findByPk(req.body.submissionId);
    console.log(req.body);
    // return

    let new_complainant = {
        court: req.body.court,
        courtDistrict: req.body.courtDistrict,
        agency: "TTPS",
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        regNum: req.body.regNum,
        rank: req.body.rank,
        unit: req.body.unit,
        submissionId: req.body.submissionId
    };

    console.log('\n\n\n New Complainant: ', new_complainant);
    

    try {
        const complainant = await ComplainantModel.create(new_complainant, {});
        console.log('New Complainant Created In Sequelize', complainant);

        await  complainant.update({status: 'complainant_saved'});
        // await SubmissionModel.update(
        //   { status: 'complainant_saved' },
        //   { where: { id: req.body.submissionId } }
        // );

        res.status(201).json({
          outcome: 'success',
          complainant: complainant          
        })
    } catch (error) {
    console.log('Error Creating Complainant In Sequelize', error)
    res.status(201).json({
        outcome: 'error', 
        error:  "error"
    });
    }
    

}

export const saveAccused = async (req, res) => {
  let accused = req.body;
  let new_accused = await AccusedModel.create(accused);
  console.log(new_accused)
  res.status(201).json({
    outcome: 'success', 
    accused: new_accused
  })
}

export const accuseds = async (req, res) => {
  const id = req.params.id;
  // console.log('\n\n\n Passed id for submission in path: ', id);
  let returned_accuseds = await AccusedModel.findAll({
    where: {submissionId: id}
  });
  // let returned_accuseds = await Accused.findAll();
  // console.log('All accuseds returned: ', returned_accuseds);
  res.status(200).json({
    outcome: 'success',
    // accused: returned_accuseds 
    accuseds: returned_accuseds
  })
}



export const updateTitle = async (req, res) => {
  console.log(req.body);

  const id = req.body.id
  const title = req.body.title
  console.log('updateTitle posted to for ID ' + id, req.body);
  let submission = await SubmissionModel.findByPk(id)
  let updated_submission = await submission.update({ description: title }, {
                              where:{id: submission.id}
                            })
  // console.log('')
  res.status(201).json({
    outcome: 'success',
    submission: updated_submission
  })

}

export const updateComplainant = async (req, res) => {

  const complainant = req.body;

  console.log('\n\n Complainant passed to update is: ', complainant);

  let returned_complainant = await ComplainantModel.findOne({
    where: {
      submissionId: complainant.submissionId
    }
  });
  let updated_complainant = await ComplainantModel.update({complainant}, { where: {
                            submissionId: complainant.submissionId
                          }});
  
  res.status(200).json({
    outcome: 'success',
    complainant: updated_complainant
  });

}

export const createIndictable = async (req, res) => {

  console.log('Body passed to controller: ', req.body);

  // let user = await UserModel.findOne({
  //   where: {email: req.body.email}
  // });

  let submission = req.body.submission;

  let user = await UserModel.findByPk(submission.userId);


  submission['userId'] = user.id;

  console.log('\n\n\n Submission to be created: ', submission)

  let new_submission = await SubmissionModel.create(submission)

  console.log('Submission created: ', new_submission);

  res.status(201).json({
    outcome: 'success', 
    submission: new_submission
  })

}

export const create = async (req, res) => {

  //   let new_user = {
  //       agencyMemberUniqueId: req.body.reg_number,
  //       agencyName: req.body.agency,
  //       password: bcrypt.hashSync(req.body.password, 8),
  //       username: req.body.email,
  //       firstName: req.body.first_name,
  //       lastName: req.body.last_name,
  //       email: req.body.email
  //   }

  console.log('\n\n\n request body with matterType', req.body)
  console.log('\n\n\n');

  // let user = await UserModel.findOne({
  //   where: {email: req.body.email}
  // })
  // let user = await UserModel.findByPk(req?.body?.uid || 0)
  let user = await UserModel.findByPk(req.body.userId);
  console.log("User: ", user)

  let new_submission = {
    description: req.body.title,
    userId: req.body.userId,
    status: 'pending',
    type: req.body.type,
    matterType: req.body.matterType,
    adultOnly: req.body.adultOnly
  }

  try {
    const submission = await SubmissionModel.create(new_submission)

    let last_id = 0;

    await SubmissionModel.findAndCountAll()
    .then(data => {
        last_id = data.rows[data.rows.length - 1].dataValues.id
        // console.log('Sucessfully fetched all SubmissionModel.. Last ID is: ', data.rows[data.rows.length - 1].dataValues.id);
        console.log('Sucessfully fetched all SubmissionModel.. Last ID is: ', last_id);
    });

    console.log('New Submission Created In Sequelize with ID: ', last_id)
    res.status(201).json({
      outcome: 'success', 
      //   message: "Successfully registered: OTP send to " + req.body.email,
      submission_id: last_id
    })
  } catch (error) {
    console.log('Error Creating Submission In Sequelize', error)
    res.status(201).json({
      outcome: 'error', 
      error: "" 
    });
  }


  
}

async function getPass(newPass, id){
  //check to see if the password has been changed
  User.findByPk(id)
    .then(async data => {
      var oldpass = data.password
      console.log("+++++++++++++++++++++++++++++++++++++++++++" + oldpass + "+++++++++++++++++++++++++++++++++++++++++++")
      console.log("New Pass: " + newPass)
      console.log("Old Pass: " + oldpass)
      if(oldpass == newPass){
        console.log("FOUND OLD PASS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        return(oldpass);
      }
      else{
        console.log("FOUND NEW PASS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        const newHash = await bcrypt.hash( newPass, saltRounds) 
        console.log(newHash)
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        return(newHash);
      }
    }) 
    .catch(err => {
      console.log(err)
    });
};

export const update = async (req, res) => {
  let submission = await SubmissionModel.findByPk(req.body.id)
  let submission_update = req.body
  let updated_submission = await submission.update(submission_update)
  res.status(201).json({
    outcome: 'success',
    submission: updated_submission
  })
}

// exports.update = async (req, res) => {
//   //console.log(req.body)
//   // Validate request
//   if (!req.body.username
//     && !req.body.email
//     && !req.body.password
//     && !req.body.role
//     && !req.body.id
//     )
//   {
//     res.status(400).send({
//       message: "Content can not be empty!"
//     });
//     return;
//   }
//   const id = req.params.id;
//   //console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")
//   console.log(id)
//   //console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")
//   //console.log("Pass = "+req.body.password+ "   --- Updated Password = "+updatedPass)

//   bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
//         const user ={
//           id: req.body.id,
//           password: hash,
//           username: req.body.username,
//           first_name: req.body.first_name?req.body.first_name:"",
//           last_name: req.body.last_name?req.body.last_name:"",
//           email: req.body.email?req.body.email:"",
//           address: req.body.address?req.body.address:"",
//           phone: req.body.phone?req.body.phone:"",
//           role: req.body.role?req.body.role:"",
//         }
        
//         const address = req.body.address?req.body.address:"";

//         //return
//         User.update(user,
//           {
//           where: { id: id }
//         })
//           .then(num => {
//             if (num == 1) {
//               res.send({
//                 message: "User was updated successfully."
//               });
//             } else {
//               res.send({
//                 message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
//               });
//             }
//           })
//           .catch(err => {
//             res.status(500).send({
//               message: "Error updating User with id=" + id
//             });
//           });

//   });
// };

export const updateMessage = async (req, res) => {
  //console.log(req.body)
  // Validate request
  if (!req.body.firebaseId
    && !req.body.message
    )
  {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  
  console.log(req.body.firebaseId)

  const user ={
    notifications: req.body.notifications
  }
  console.log(user)
  
  //return
  User.update(user,
    {
    where: { firebaseId: req.body.firebaseId }
  })
    .then(num => {
      console.log(num)
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${req.body.firebaseId}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + req.body.firebaseId
      });
    });

};

export const del = (req, res) => {
  console.log("YYYYYYYY&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  console.log(req.params.id)
  console.log("YYYYYYYY&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          status: 200, message: "User was deleted successfully!"
        });
      } else {
        res.send({
          status: 200, message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

export const findAllPublished = (req, res) => {
  User.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
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
  
  // Hash the new password
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.status(500).send({
        message: "Error hashing password: " + err.message
      });
      return;
    }

    // Update the user's password in MySQL
    const user = {
      password: hash
    };
    
    User.update(user, {
      where: { firebaseId: req.body.firebaseId,  username: req.body.email}
    })
    .then(num => {
      console.log(num)
      if (num == 1) {
        // Update the corresponding user document in Firestore
        const firestore = fs.firestore();
        const userRef = firestore.collection('users').doc(req.body.firebaseId);

        userRef.update({
          password: hash
        })
        .then((data) => {
          console.log(data)
          res.send({
            message: "User password was updated successfully."
          });
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating user document in Firestore: " + err.message
          });
        });
      } else {
        res.send({
          message: `Cannot update User with id=${req.body.firebaseId}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User password with id=" + req.body.firebaseId + ": " + err.message
      });
    });
  });
};

//handle Request to reset password from email
export const forgotPasswordRequest = async (req, res) => {
  const { username } = req.body;

  // Generate a unique password reset token
  const token = uuidv4();

  // Store the password reset token in the database along with the user's email and a timestamp
  const expiresAt = moment().add(1, 'hour').toDate(); // Token expires after 1 hour
  await PasswordResetModel.create({ username, token, expiresAt });

  // Send an email to the user containing a link to the password reset page
  const transporter = nodemailer.createTransport({
    host: '10.0.1.99',
    port: 25,
    secure: false,
    // auth: {
    //   user: 'emailer@jsswf.sytes.net',
    //   pass: ''
    // }
  });

  const resetUrl = `https://swif.ttlawcourts.org/api/users/password/new?token=${token}`;
  const mailOptions = {
    from: 'swif-noreply@ttlawcourts.org',
    to: username,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: ${resetUrl}`
  };
  await transporter.sendMail(mailOptions);

  // Return a success response to the user
  res.send('An email with instructions for resetting your password has been sent to your email address.');

}

// password forget page
export const handlePasswordForgotPage = async (req, res) => {
  const { token } = req.query;

  // Find the password reset token in the database
  const resetToken = await PasswordResetToken.findOne({ where: { token } });

  // Verify that the token is valid and has not expired
  if (!resetToken || moment(resetToken.expiresAt).isBefore(moment())) {
    res.send('Invalid or expired password reset token.');
    return;
  }

  // Redirect the user the password reset page
  // res.render('reset-password', { token });
  console.log('Redirecting the user back to the reset token page');
  res.redirect(`https://swif.ttlawcourts.org/user/password/new?token=${token}`);
}

// handle forgot password
export const resetPasswordFromEmail = async (req, res) => {
  const { password, token } = req.body;
  console.log("Query: ",req.body)


  // Find the password reset token in the database
  const resetToken = await PasswordResetToken.findOne({ where: { token } });

  // Verify that the token is valid and has not expired
  if (!resetToken || moment(resetToken.expiresAt).isBefore(moment())) {
    res.send('Invalid or expired password reset token.');
    return;
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the user's password in the database
  await User.update({ password: hashedPassword }, { where: { username: resetToken.username } });

  // Delete the password reset token from the database
  await resetToken.destroy();

  // Return a success response to the user
  res.send('Your password has been reset successfully.');
};

export const requestSignature = async (req, res) => {

 
  function getCurrentTimeInTrinidad() {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Port_of_Spain' // Time zone for Trinidad and Tobago
    };

    const trinidadTime = new Date().toLocaleTimeString('en-US', options);
    return trinidadTime; // Returns time in Trinidad and Tobago time zone
  }

  const currentTime = getCurrentTimeInTrinidad();
  const pathToImage = 'https://www.ttlawcourts.org/images/swf-logo.png';


  const resetEmailString = `
  <!DOCTYPE html>
    <html>
    <head>
        <title>Verification Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                font-size:14px;
            }
            .container {
                width: 80%;
                margin: auto;
                overflow: hidden;
            }
            .logo {
                width: 100px;
                height: 75px;
            }
            .code {
                font-size: 30px;
                color: #333;
                letter-spacing:5px;
                font-weight: bold;
            }
            .footer {
                font-size: 12px;
                color: #999;
            }
            .security-tip {
                color: #ff0000;
            }

            .small-text {
              font-size: 10px;
          }

          .swf-text{
            font-size: 14px;
          }

          .swf-grey-bg{
            background-color:#eee;
            padding:20px;
            color:#222;
          }

          .swf-grey-red{
            background-color:#f8e6e0;
            padding:20px;
            color:#222;
            margin-top:10px; 
          }
          .swf-time{
            margin-top:10px; margin-bottom:30px
          }

        </style>
    </head>
    <body>
        <div class="container">
            <img src="${pathToImage}" alt="SWF Logo" class="logo"/>

            <p class="swf-text">Hi, <b></b></p>
            <p class="swf-text">Your signature has been requested on a submission in SWiF</p>

            <p class="swf-text">Click <a href="${process.env.APP_DOMAIN + '/sign/' + req.body.submission_id}">here</a> to sign submission</p>  
        

            <p class="small-text swf-time">This signature request was generated at ${currentTime}</p>

            <div class="swf-grey-bg">
            <p>Do not share this verification code with a third party or other employee. We will NEVER ask you for this code.</p>

            </div>

            <p class="security-tip swf-grey-red "><b>Security Tip</b><br/>
            SWF will never send you unsolicited emails asking for confidential information, such as your Password, Verification Code, or User ID. 
            We will never ask you to validate or restore your account access through email or pop-up windows.</p>
            
        </div>
    </body>
    </html>`



  let signatureRequest = req.body;
  console.log('\n\n\n Request Body: ', req.body);
  let transporter = nodemailer.createTransport(mailConfig);

  await transporter.sendMail({
    from: `SWF <${SWF_EMAIL}>`,
    to: req.body.complainant_email,
    subject: 'SWF - Submission',
    html: resetEmailString,
  });

  // await transporter.sendMail({
  //   from: 'JSSWF <omm@link868.com>',
  //   to: req.body.complainant_email,
  //   subject: 'Complaint with Oath',
  //   html: htmlEmailString
  // });




  res.status(201).json({
    outcome: 'success'
  })
}

export const signIndictable = async (req, res) => {

}