const db = require("../models/index");
const Submission = db.submissions;
const Complainant = db.complainants;
const User = db.users;
const Accused = db.accuseds;
const Charges = db.charges; 
const PasswordResetToken = db.password_reset_token;
const Op = db.Sequelize.Op;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const formidable = require('formidable')
const nodemailer = require('nodemailer');
const moment = require('moment');
const {format} = require('date-fns')
const { v4: uuidv4 } = require('uuid');
const TOTPGenerator = require('../utilities/TOTPGenerator.class');
const mailConfig = require('../config/mail.config');
// const nodemailer = require('nodemailer');

exports.findAll = (req, res) => {

    Submission.findAndCountAll()
    .then(data => {
        console.log('Submissions Fetched: ', data.rows[data.rows.length - 1].dataValues.id);
        res.status(201).json({
            outcome: 'success',
            submissions: data
        });
    })
    .catch(error => {
        res.status(201).json({
            outcome: 'error', 
            error: error.errors[0].message 
          });
    });

}

//  

exports.findOne = async (req, res) => {


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

  let submission = await Submission.findByPk(id)

  let complainant = await Complainant.findOne({
    where: {
      submissionId: id
    }
  })

  console.log('\n\n\n\n Submission complainant: ', complainant);
  console.log('\n\n\n\n');

  let accuseds = await Accused.findAll({
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

exports.authenticateUser = async (req, res) => {
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

exports.saveComplainant = async (req, res) => {

    console.log('\n\n\n attempting to save complainant \n\n\n');  

    let transporter = nodemailer.createTransport(mailConfig);

    let submission = await Submission.findByPk(req.body.submissionId);

    console.log('')

    let new_complainant = {
        court: req.court,
        courtDistrict: req.courtDistrict,
        agency: "TTPS",
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        regNum: req.body.regNum,
        submissionId: req.body.submissionId
    }

    // console.log('\n\n\n New Complainant: ', new_complainant);

    try {
        const complainant = await Complainant.create(new_complainant, {});
        console.log('New Complainant Created In Sequelize', complainant);

        await  submission.update({status: 'complainant_saved'});

        res.status(201).json({
          outcome: 'success'          
        })
    } catch (error) {
    console.log('Error Creating Complainant In Sequelize', error)
    res.status(201).json({
        outcome: 'error', 
        error: error.errors[0].message 
    });
    }
    

}

exports.saveAccused = async (req, res) => {
  let accused = req.body;
  let new_accused = Accused.create(accused);
  res.status(201).json({
    outcome: 'success', 
    accused: new_accused
  })
}

exports.accuseds = async (req, res) => {
  const id = req.params.id;
  // console.log('\n\n\n Passed id for submission in path: ', id);
  let returned_accuseds = await Accused.findAll({
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

exports.updateTitle = async (req, res) => {
  const id = req.body.id
  const title = req.body.title
  console.log('updateTitle posted to for ID ' + id, req.body);
  let submission = await Submission.findByPk(id)
  updated_submission = await submission.update({ description: title })
  // console.log('')
  res.status(201).json({
    outcome: 'success',
    submission: updated_submission
  })

}

exports.updateComplainant = async (req, res) => {

  const complainant = req.body;

  console.log('\n\n Complainant passed to update is: ', complainant);

  let returned_complainant = await Complainant.findOne({
    where: {
      submissionId: complainant.submissionId
    }
  });
  let updated_complainant = await returned_complainant.update(complainant);
  
  res.status(200).json({
    outcome: 'success',
    complainant: updated_complainant
  });

}

exports.create = async (req, res) => {

  //   let new_user = {
  //       agencyMemberUniqueId: req.body.reg_number,
  //       agencyName: req.body.agency,
  //       password: bcrypt.hashSync(req.body.password, 8),
  //       username: req.body.email,
  //       firstName: req.body.first_name,
  //       lastName: req.body.last_name,
  //       email: req.body.email
  //   }

  let user = await User.findOne({
    where: {email: req.body.email}
  })

  let new_submission = {
    description: req.body.title,
    userId: user.id
  }

  try {
    const submission = await Submission.create(new_submission)

    let last_id = 0;

    await Submission.findAndCountAll()
    .then(data => {
        last_id = data.rows[data.rows.length - 1].dataValues.id
        // console.log('Sucessfully fetched all submissions. Last ID is: ', data.rows[data.rows.length - 1].dataValues.id);
        console.log('Sucessfully fetched all submissions. Last ID is: ', last_id);
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
      error: error.errors[0].message 
    });
  }


  
}

// exports.create = async (req, res) => {
//   const form = new formidable.IncomingForm();
//     form.parse(req, async (err, fields, files) => {
//         if (err) {
//             res.status(500).json({ message: err });
//             return;
//         }
//         console.log(fields)
//         const { firebase_id, password, username, fullname, first_name, last_name, email, address, phone, role } = fields;
//         if (!firebase_id || !password || !username || !fullname) {
//             res.status(400).json({ message: "Please provide firebase_id, password, username, fullname" });
//             return;
//         }

//         try {
//             const user = await User.create({
//                 firebase_id,
//                 password: bcrypt.hashSync(password, 8),
//                 username,
//                 fullname,
//                 first_name,
//                 last_name,
//                 email,
//                 address,
//                 phone,
//                 role,
//             });
//             res.status(201).json({ message: "User created successfully", user });
//         } catch (error) {
//             res.status(500).json({ message: error.message });
//         }
//     });
// };

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

exports.update = async (req, res) => {
  //console.log(req.body)
  // Validate request
  if (!req.body.username
    && !req.body.email
    && !req.body.password
    && !req.body.role
    && !req.body.id
    )
  {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  const id = req.params.id;
  //console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")
  console.log(id)
  //console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")
  //console.log("Pass = "+req.body.password+ "   --- Updated Password = "+updatedPass)

  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        const user ={
          id: req.body.id,
          password: hash,
          username: req.body.username,
          first_name: req.body.first_name?req.body.first_name:"",
          last_name: req.body.last_name?req.body.last_name:"",
          email: req.body.email?req.body.email:"",
          address: req.body.address?req.body.address:"",
          phone: req.body.phone?req.body.phone:"",
          role: req.body.role?req.body.role:"",
        }
        
        const address = req.body.address?req.body.address:"";

        //return
        User.update(user,
          {
          where: { id: id }
        })
          .then(num => {
            if (num == 1) {
              res.send({
                message: "User was updated successfully."
              });
            } else {
              res.send({
                message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
              });
            }
          })
          .catch(err => {
            res.status(500).send({
              message: "Error updating User with id=" + id
            });
          });

  });
};

exports.updateMessage = async (req, res) => {
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

exports.delete = (req, res) => {
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

exports.findAllPublished = (req, res) => {
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

exports.resetPassword = async (req, res) => {
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
exports.forgotPasswordRequest = async (req, res) => {
  const { username } = req.body;

  // Generate a unique password reset token
  const token = uuidv4();

  // Store the password reset token in the database along with the user's email and a timestamp
  const expiresAt = moment().add(1, 'hour').toDate(); // Token expires after 1 hour
  await PasswordResetToken.create({ username, token, expiresAt });

  // Send an email to the user containing a link to the password reset page
  const transporter = nodemailer.createTransport({
    host: 'mail.link868.com',
    port: 465,
    secure: true,
    auth: {
      user: 'emailer@jsswf.sytes.net',
      pass: ''
    }
  });

  const resetUrl = `http://localhost:4001/api/users/password/new?token=${token}`;
  const mailOptions = {
    from: 'emailer@jsswf.sytes.net',
    to: username,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: ${resetUrl}`
  };
  await transporter.sendMail(mailOptions);

  // Return a success response to the user
  res.send('An email with instructions for resetting your password has been sent to your email address.');

}

// password forget page
exports.handlePasswordForgotPage = async (req, res) => {
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
  res.redirect(`http://localhost:3000/user/password/new?token=${token}`);
}

// handle forgot password
exports.resetPasswordFromEmail = async (req, res) => {
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

exports.requestSignature = async (req, res) => {
  let signatureRequest = req.body;
  console.log('\n\n\n Request Body: ', req.body);
  let transporter = nodemailer.createTransport(mailConfig);
  await transporter.sendMail({
    from: 'JSSWF <omm@link868.com>',
    to: req.body.complainant_email,
    subject: 'Complaint with Oath',
    text: `New complaint with oath requires your signature http://jsswf.sytes.net/sign/${req.body.submission_id}`
  });
  res.status(201).json({
    outcome: 'success'
  })
}


