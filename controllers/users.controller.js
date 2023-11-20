const db = require("../models/index");
const User = db.users;
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



//**************** */
exports.findAll = (req, res) => {
    var sortObject = {};
    var filterObject = {};
    var stype = req.query.sort_field
    var sdir = req.query.sort_order
    sortObject[stype] = sdir;
    filterObject = req.query.filter;
    var page = req.query.page
    var filter = req.query.filter ? req.query.filter : ""
    var limit = req.query.perPage
    var user_role = req.query.user_role ? req.query.user_role : ""
    console.log("+++++++++++++++++++++++++++");
    console.log(req.query)
    console.log("+++++++++++++++++++++++++++");
    var myFilter = ""
    if(req.query.q != "")
    {
      myFilter = req.query.q;
    }

    // let where = {
    //   role:{
    //     [Op.ne]:5
    //     }
    //   }

    // if(user_role == 5){
    //   where = {
    //     role:{
    //       [Op.gt]:0
    //       }
    //     }
    // }


User.findAndCountAll(
  // {
  //   where: where,
  // }
)
    .then(data => {
      let x = data.rows.length;
      //console.log(x); 
      User.findAndCountAll(
      //   {
      //     offset: (page - 1) * limit,
      //     limit: limit * 1,
      //     order: [
      //       [stype, sdir],
      //     ],
      //     where: where
      // }
      )
      .then(json => {
          let res_header = {"content-range": "posts 0-"+limit+"/"+x}
          console.log(">>>>>>")
          res.header(res_header);
          res.send(json.rows);
        })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Dcouments."
        });
      });
    })








};

exports.findOne = (req, res) => {
  const id = req.params.id;
  User.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
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

exports.create = async (req, res) => {

  let new_user = {
      agencyMemberUniqueId: req.body.reg_number,
      agencyName: req.body.agency,
      password: bcrypt.hashSync(req.body.password, 8),
      username: req.body.email,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email
  }

  try {
    const user = await User.create(new_user)
    const totp = new TOTPGenerator()
    totp.generateOTP(req.body.email)
    console.log('New User Created In Sequelize')
    res.status(201).json({
      outcome: 'success', 
      message: "Successfully registered: OTP send to " + req.body.email,
      email: req.body.email
    })
  } catch (error) {
    console.log('Error Creating User In Sequelize', error)
    res.status(201).json({
      outcome: 'error', 
      error: '' //error.errors[0].message 
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


