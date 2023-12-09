// External libraries first
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import cors from 'cors';
import _ from "lodash";
import { v4 as uuid } from "uuid";
import { Sequelize, DataTypes } from 'sequelize';
import AdminBro from 'admin-bro';
import AdminBroExpress from '@admin-bro/express';
import AdminBroSequelize from '@admin-bro/sequelize';
import mysql from "mysql2";
import winston from 'winston';
import fs from 'fs';
import expressListRoutes from 'express-list-routes';
import nodemailer from 'nodemailer';
import session from 'express-session';
import http from "http";
import https from 'https';
import ejs from 'ejs';
import Redis from 'redis';
import { Server as SocketIO } from 'socket.io';
import { getUserByEmail, getStoredOTP, deleteStoredOTP } from './controllers/admin_users.controller.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import {MorganMiddleware} from "./middlewares/morgan.middleware.js"

// The morgan middleware does not need this.
// This is for a manual log
import {Logger} from "./utilities/logger.js";



// Read the SSL certificate files
const key = fs.readFileSync(path.resolve(__dirname, './key.pem'));
const cert = fs.readFileSync(path.resolve(__dirname, './cert.pem'));

// Internal libraries next

import { db, UserModel, SubmissionModel } from "./models/index.js";
import { dbConfig } from './config/db.config.js';
import { TOTPGenerator } from './utilities/TOTPGenerator.class.js';
import { mailConfig } from './config/mail.config.js';
// import { adminUser } from './controllers/admin_users.controller.js';
import { redisClient, redisStore, userChannel } from './redis/redisConfig.js'

import passwordRoutes from './routes/password.routes.js';
import {setupRoutes} from './routes/index.routes.js';

import {errorHandler} from './utilities/errorHandler.js';



//internal vars
const AGENCY_NAME = process.env.REACT_APP_AGENCY_NAME
const AGENCY_CODE = process.env.REACT_APP_AGENCY_CODE
const JWT_SECRET = process.env.JWT_SECRET
const PORT = process.env.PORT || 3000
const PORT_SSL = process.env.PORT_SSL || 443
const ADMIN_PORT = process.env.ADMIN_PORT || 8080

//console.log("secret",JWT_SECRET);

//JSSWF
//USED TO GENERATE A NEW SECRET (uncomment when needed)
// const crypto = require('crypto');
// const secret = crypto.randomBytes(1024).toString('hex');
// console.log(secret); 
//-----------------------------------------------------



//BEGIN----------------------------------------------------------------
// ********************************************************************


//________________________________________________
// DATABASES
//------------------------------------------------
  const connection =  mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
  });   
  // Open the connection to MySQL server
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.DB}`, function (err, result) {
        if (err) throw err;
        console.log("Database running successfully");
    });
  });

  // Close the connection
  //connection.end();

  //________________________________________________
  // SYNC Database -  USE WHEN NECESSARY
  //---------------------------------------------
  // db.sequelize.sync();
  //----------------------------------------------------------------


//________________________________________________
// EXPRESS APP INITIALIZATION
//------------------------------------------------
const app = express();
//setup HTTP request logging immediately
// Add the morgan middleware
app.use(MorganMiddleware);
// *** Strictly for testing purposes - don't leave it running ***
// ***************************************************************
// app.get("/api/status", (req, res) => {
//   Logger.info("Checking the API status: Everything is OK");
//   res.status(200).send({
//       status: "UP",
//       message: "The API is up and running!"
//   });
// });
// ***************************************************************
//----------------------------------------------------------------

// Set the view engine to ejs (presenting OTP and Log in forms...)
app.set('view engine', 'ejs');

// Set the directory where the template files are located
app.set('views', path.join(__dirname, 'views'));

// Create an HTTPS server with certificate (may not be necessary in production)
const server = https.createServer({ key: key, cert: cert }, app);
// or create an HTTP Serve
// const server = http.createServer(app);

//use cookie parser
// app.use(cookieParser());


//MIDDLEWARE ----------------------------------------------------------------
//------------------------------------------------
// CORS MIDDLEWARE
//------------------------------------------------
var allowedDomains = [
  'http://swf.ttlawcourts.org', 'https://swf.ttlawcourts.org', 
  'http://jsswf.sytes.net', 'https://jsswf.sytes.net', 
  'http://localhost:3000', 'https://localhost:3000',
  'http://localhost:5173', 'https://localhost:5173',
  'http://localhost:8443', 'https://localhost:8443',
  'http://localhost:8080', 'https://localhost:8080',
  'http://127.0.0.1:5173', 'https://127.0.0.1:5173',
  'http://localhost', 'https://localhost'
 ];
  app.use(cors({
    origin: function (origin, callback) {
      // bypass the requests with no origin (like curl requests, mobile apps, etc )
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
          var msg = `This site ${origin} does not have access.`;
          return callback(new Error(msg), false);
      }
      return callback(null, true);
      },
      methods: ["GET", "POST", "PUT"],
      // allowedHeaders: ["my-custom-header"],
      credentials: true,
      transports: ['websocket', 'polling'],
  }));



  //----------------------------------------------------------------
  //SESSION MIDDLEWARE
  //----------------------------------------------------------------
    /*
    // if using session memory only. Not for production use
    app.use(session({ 
      secret: JWT_SECRET, 
      resave: false, 
      saveUninitialized: true,
      cookie: { secure: false } // Set to true if using HTTPS
     }));
     */

     // if using redis as session store. Production use
    //  app.use(session({
    //   store: redisStore,
    //   secret: JWT_SECRET, // Replace with a strong secret
    //   resave: false,
    //   saveUninitialized: true,
    //   cookie: {
    //     secure: false, // Set to true if using HTTPS
    //     httpOnly: true, // Mitigate XSS attacks
    //     maxAge: 1000 * 60 * 60 * 24 // 24 hours (for example)
    //   }
    // }));
    app.use(session({
      store: redisStore,
      secret: JWT_SECRET, // Replace with a strong secret
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, // Set to false if in development with self-signed certificates
        httpOnly: true, // Mitigate XSS attacks
        maxAge: 1000 * 60 * 60 * 24, // 24 hours (for example)
        // sameSite: 'none' //Lax or 'strict' or 'none' // 'none' Needed for cross-site requests
      }
    }));
  //------------------------------------------------
  //LOGGING 
          // app.use((req, res, next) => {
          //   console.log('Incoming request:', req.method, req.path);
          //   console.log('Headers:', req.headers);
          //   next();
          // });

          // app.use((req, res, next) => {
          //   console.log('Session data:', req.session);
          //   next();
          // });
          
    //LOGGING
  //------------------------------------------------
  //----------------------------------------------------------------
    //BODY PARSER MIDDLEWARE
    //----------------------------------------------------------------
    app.use(bodyParser.json({ limit: '5mb' }))
    app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
  //----------------------------------------------------------------
  //----------------------------------------------------------------
  //________________________________________________
  // STATIC FILE MIDDLEWARE
  //------------------------------------------------
  app.use(express.static('public'));
  app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
  app.use(express.static( 'dist'));
  app.use('/public', express.static(path.join(__dirname, 'public')));

  //----------------------------------------------------------------
  //----------------------------------------------------------------


  //----------------------------------------------------------------
    //PASSWORD ROUTES
    //----------------------------------------------------------------
    passwordRoutes(app);



  //________________________________________________
  //ADMINBRO MIDDLEWARE
  //------------------------------------------------
  var message = `A verification code has just been sent to your registered email address. 
                   Please enter this code in the box below to confirm your login.`;
  var error = ""
    //Custom Admin Router ------------------------------------------------
    const customAdminRouter = express.Router();
    customAdminRouter.get('/ttps/admin/login', async (req, res) => {
      // Render custom login page (including OTP field or separate OTP page)
      res.render('login', {  });
    });

    customAdminRouter.get('/admin/login', async (req, res) => {
      // Render custom login page (including OTP field or separate OTP page)
      res.render('login', { message: message });
    });

    customAdminRouter.get('/ttps/admin/mfa', async (req, res) => {
      if (req.session.otp_user = {}) {
        console.log(req?.session?.otp_user || "NO OTP USER" )
        res.redirect('/admin/login'); // Replace '/login' with your login route
      }
    });

    customAdminRouter.post('/ttps/admin/mfa', async (req, res) => {
      
      if (!req.body) {
        res.status(400).json({ error: "Request body is empty" });
        return;
      }
      console.log("MFA session: ", req.session)
      console.log(">> session id: ", req.session.id)
      console.log("---------------------------- ")
      console.log("Headers: ", req.headers)
      console.log("---------------------------- ")
      const authHeader = req?.headers?.authorization;

      if (!req.body.otp || !authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("---error--------")
        return res.status(401).json({ outcome: 'error', message: 'No token provided' });
      }
      if(authHeader.startsWith('Bearer ')){
        console.log("it does")
      }
      const token = authHeader.split(' ')[1];


      if (req.session.otp_user == {}) {
        res.redirect('/admin/login'); // Replace '/login' with your login route
      }

      const uid = req?.session?.otp_user?.id || ""
      const email = req?.session?.otp_user?.email || ""
      const { otp } = req.body;      
      console.log(otp);
      try {
          console.log("incoming: ", otp);
          const keyToget = `otp:${req.session.id}`;
          console.log("Key to get: ", keyToget)
          console.log("---------------------------- ")
          const storedOTP = await getStoredOTP(keyToget, otp);
          console.log("---------------------------- ")
          const theStoredOTP = `${storedOTP?.code || ""}`;
          console.log("stored otp: ", theStoredOTP);
          console.log("incoing otp: ", otp);

          // Initialize incorrect attempts counter if it does not exist
          if (!req.session.incorrectOtpAttempts) {
            req.session.incorrectOtpAttempts = 0;
            console.log("first attempt");
          }

          if (theStoredOTP !== `${otp}`) {
            req.session.incorrectOtpAttempts += 1;
            console.log("Attempt: ", req.session.incorrectOtpAttempts );
            if (req.session.incorrectOtpAttempts >= 3) {
              // Reset counter and redirect to login
              req.session.incorrectOtpAttempts = 0;
              //remove otp_user form session
              req.session.otp_user = {};
              console.log("Attempt: ", req.session.incorrectOtpAttempts );
              res.redirect('/admin/login'); // Replace '/login' with your login route
              return;
            }
            message = ``;
            error = `OTP Code is incorrect. Please try again`;
            console.log("OTP Code Incorrect")
            console.log("Count of Attempt: ", req.session.incorrectOtpAttempts );
            // return
            res.status(200).send({message: "FAIL", error: "Incorrect verification code. Please try again."});
            // res.render('otp', { error: error, message: message, token});
          }
          else{
            console.log("OTP Code Correct")
            req.session.adminUser = {
              id: uid, // or any identifier you use for the user
              email: email, // or username, depending on your system
              // Any other user details you might need
            };
            //remove otp_user form session
            req.session.otp_user = {};
            message = `A verification code has just been sent to your registered email address. 
                   Please enter this code in the box below to confirm your login.`;

            req.session.isAuthenticated = true; // Mark the session as authenticated
            req.session.incorrectOtpAttempts = 0; // Reset counter on successful attempt

            console.log(req.session)
            // const delKey = await deleteStoredOTP(keyToget);
            res.status(200).send({message: "VERIFIED", error: ""});
            // res.redirect('/admin'); // Redirect to the AdminBro dashboard
          }
      } catch (error) {
        console.log(error)
        res.status(500).send({message: "error"})
        // res.render('otp', { error: `OTP Code is incorrect. Please try again`, message: "" });
      }
    });

    customAdminRouter.post('/ttps/admin/login', async (req, res) => {

      console.log("LOGIN session: ", req.session)
      console.log(">> session id: ", req.session.id)
      console.log("---------------------------- ")


      console.log(req.body)
      if (!req.body) {
        res.status(400).json({ error: "Request body is empty" });
        return;
      }
      // console.log(req.body);

      const { username, password } = req.body;
      const email = username;
      const plainTextPassword = password;
      // console.log(email);
      try {
          // console.log(email);
          const user = await getUserByEmail(email);
          // console.log(user)
          if (!user && !user.dataValues && !user.dataValues.password && !user.dataValues.email) {
              res.status(404).json({ status: 'error', message: "User not found" });
              return;
          }
          // console.log(user.dataValues);

          const storedPassword = user?.dataValues?.password || "";
          const passwordMatch = await bcrypt.compare(plainTextPassword, storedPassword);
          if (passwordMatch) {
            console.log("match");
              //the session .adminUser must not be saved until final login step
              req.session.otp_user = {
                id: user?.dataValues?.id || "", // or any identifier you use for the user
                email: user.dataValues.email, // or username, depending on your system
              };
              console.log(req.session.otp_user);

              const token = jwt.sign(
                { userId: user?.dataValues?.id || "", 
                email: user?.dataValues?.email || "" }, // Payload
                process.env.JWT_SECRET, // Secret
                { expiresIn: '1h' } // Token expiry
              );
              console.log(token);

              console.log("Found a match");
              try {
                  
                var message = `A verification code has just been sent to your registered email address. 
                   Please enter this code in the box below to confirm your login.`;
                const totp = new TOTPGenerator();
                  await totp.generateOTP(req.session.id, user.dataValues.email, user.dataValues.firstName);
                  // await totp.generateOTP(token, user.dataValues.email, user.dataValues.firstName);
                  // res.render('otp', { message: message }); // Render a page for OTP input
                  res.render('otp', { error: ``, message: message, token: token, attempts: 0 });
                  // res.render('otp', { error: ``, message: message });
              } catch (error) {
                  console.error('Error generating or sending OTP:', error);
                  res.render('login', { error: 'An error occurred. Please try again' });
              }

          } else {
              res.render('login', { error: 'Invalid username and or password. Please try again.' });
              // return{ status: 'error', message: "Password does not match" };
          }
      } catch (error) {
        res.render('login', { error: 'An error occurred. Please try again' });
        return({ status: 'error', message: "An error occurred. Please try again" });
      }
    });


    // const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dashboardComponentPath = path.join(__dirname, 'views', 'my-dashboard-component.jsx');
    const uploadUsersComponentPath = path.join(__dirname, 'adminCustomPages', 'UploadUsers.jsx');


     //Role based access control
     const canModifyUsers = (currentAdmin) => {
      return currentAdmin && (currentAdmin.role === 'superadmin' || currentAdmin.role === 'admin');
    };
    const canCreateAdmins = (currentAdmin) => {
      return currentAdmin && currentAdmin.role === 'superadmin';
    };//........................................................
    const isSuperAdmin = (currentAdmin) => currentAdmin && currentAdmin.role === 'superadmin';
    //........................................................



    AdminBro.registerAdapter(AdminBroSequelize)

    const locale = {
      translations: {
        labels: {
          // change Heading for Login
          loginWelcome: 'TTPS Admin Console',
        },
        messages: {
          loginWelcome: 'Welcome',
        },
      },
    };
    //________________________________________________
    const adminBro = new AdminBro({
      // databases: [ db ],
      dashboard: {
        component: AdminBro.bundle(dashboardComponentPath)
      },
      resources: [ {
          resource: UserModel,
          options: {
            properties: {
              createdAt: {
                isVisible: { list: true, filter: true, show: true, edit: false }, 
              },
              username: {
                isVisible: { list: true, filter: true, show: true, edit: false }, 
              },
              email: {
                isVisible: { list: true, filter: true, show: true, edit: false }, 
              },
            },
            actions: {
              new: { isAccessible: canCreateAdmins },
              edit: { isAccessible: canModifyUsers },
              delete: { isAccessible: canModifyUsers },
            },
          }
      },
      {
        resource: SubmissionModel,
        options: {
          properties: {
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false }, 
            },
            username: {
              isVisible: { list: true, filter: true, show: true, edit: false }, 
            },
            email: {
              isVisible: { list: true, filter: true, show: true, edit: false }, 
            },
          },
          actions: {
            new: { isAccessible: canCreateAdmins },
            edit: { isAccessible: canModifyUsers },
            delete: { isAccessible: canModifyUsers },
          },
        }
    }
    ],
      rootPath: '/admin',
      assets: {
        styles: ['/admin-bro.css'], 
      },
      locale,
      branding: {
        companyName: AGENCY_NAME,
        logo: '/logo.png', 
        softwareBrothers: false, 
      },
      pages: {
        uploadUsers: {
          label: "Upload Users",
          component: AdminBro.bundle(uploadUsersComponentPath),
          isAccessible: ({ currentAdmin }) => isSuperAdmin(currentAdmin),
        }
      }
      // 
    })
    // const router = AdminBroExpress.buildRouter(adminBro)
    const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
      authenticate: async (email, password) => {
        if (req.session.isAuthenticated && req.session.adminUser) {
          return req.session.adminUser; // Return the user object if the session is authenticated
      }
        return null;
      },
      cookiePassword: JWT_SECRET,
    },
    // null, {
    //   resave: false,
    //   saveUninitialized: true,
    //   // Implement custom middleware for JWT token validation
    //   cookie: { secure: false },
    //   secret: JWT_SECRET,
    // }
    );
    //use this by default
    app.use(customAdminRouter); // Custom login and OTP routes
    app.use(adminBro.options.rootPath, router); // AdminBro routes
    // or is using custom admin router
    // app.use(router)
    // app.use(adminBro.options.rootPath, customAdminRouter);
  //----------------------------------------------------------------
  //----------------------------------------------------------------

  //________________________________________________
  // CUSTOM MIDDLEWARE
  //------------------------------------------------
  //----------------------------------------------------------------
  //----------------------------------------------------------------
  //LOGGER INCOMING REQUESTS
    // Custom middleware to log incoming requests
    function logRequests(req, res, next) {
      console.log(`${new Date().toISOString()} - ${req.method} Request to ${req.url}`);
      next(); // Move to the next middleware/route handler
    }

    // Apply the middleware to all incoming requests
    app.use(logRequests);
    // **CONSIDER USING >> Morgan for logging HTTP requests
    // with the 'combined' predefined format, 
    // or customize it as needed
    //.......................................
  //----------------------------------------------------------------
  //----------------------------------------------------------------

  //----------------------------------------------------------------
  // SOCKET.IO MIDDLEWARE
  //----------------------------------------------------------------
  let connectedUsers = {};
  const io = new SocketIO(server, {
    cors: {
      origin: function (origin, callback) {
        // bypass the requests with no origin (like curl requests, mobile apps, etc )
        if (!origin) return callback(null, true);
  
        if (allowedDomains.indexOf(origin) === -1) {
          var msg = `This site ${origin} does not have an access.`;
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      methods: ["GET", "POST", "PUT"],
    //   allowedHeaders: ["my-custom-header"],
      credentials: true,
      transports: ['websocket', 'polling'],
    }
  });
  // Use redis adapter
  // ================================================
  // socket connections + redis connections
  // ================================================
  io.on("connection", async (socket) => {
    console.log(">> A user connected:", socket.id);  

    //channels ++++++++++++++
    // join user to channels when they connect
    socket.join('drawUpdate');
    socket.join('notifyAlert');
    //--------------------------------------------  

    // On User Login event +++++++++++++++++++++++
    socket.on("login", (userId) => {
      // add the user to the connectedUsers object 
      console.log("user >>>> ", userId);
      socket.userId = userId;
      connectedUsers[socket.id] = { 
        socket: socket,
        connected: true,
        userId: userId
      };
      socket.join(`user:${userId}`);
    });

    // On UserLogout event +++++++++++++++++++++
    socket.on("loogut", ({ userId, socketId }) => {
      if (socket.userId) {
        console.log("userLogout ", userId)
        // myClient.del(socket.userId);
      }
    });

    // Listen for the "activity" +++++++++++++++
    // to ensure active users are 
    socket.on('activity', async (userId) => {
      console.log(userId)
      socket.join('drawUpdate');
      socket.join('notifyAlert');
      socket.join(`user:${userId}`);
      socket.userId = userId;
      connectedUsers[socket.id] = { 
        socket: socket,
        connected: true,
        userId: userId
      };
    });

    // Emitting a message to all channels
    //below is an example of how to chain messages emit to a number of channels
    // io.to('channel1').to('channel2').to('channel3').emit('message', 'Hello, channels!');

    // Private message to user ++++++++++++++++++++++++
    socket.on('privateMessage', async (channel, message) => {
      // const userId = channel.slice('user:'.length);
      emitter.emit(channel, message);
    });

    // Handle disconnection ++++++++++++++++++++++++
    socket.on('disconnect', () => {
      console.log(` >> Client disconnected: ${socket.id}`);
      // Unsubscribe the socket from the 'drawUpdate' channel
      delete connectedUsers[socket.id];
    });


  });






//----------------------------------------------------------------
//ROUTES
//----------------------------------------------------------------
    setupRoutes(app);
//----------------------------------------------------------------
// ***** TO BE CONFIRMED ACTIVE **** 
// CHECK THESE WIHH DEVELOPERS
//----------------------------------------------------------------
    //----------------------------------------------------------------
    //----------------------------------------------------------------
    //ROUTE TO FORM SCHEMAS
    app.get('/schema/:schemaId', async (req, res) => {
      let schemaId = req.params.schemaId
      console.log('schemaId: ' + schemaId)
      const form_schema_file = await fs.readFileSync('./forms/' + schemaId + '.json');
      const form_schema = JSON.parse(form_schema_file);
      res.json(form_schema);
    });

    // //ROUTE TO FORM SCHEMAS
    //   app.post('/register', async (req, res) => {
    //     let data = req.body;    
    //     let new_user = await User.create({
    //       username: 'janedoe',
    //       birthday: new Date(1980, 6, 20),
    //     });
        
    //     const users = await User.findAll();    
    //     res.send(data);

    //   });

        
//----------------------------------------------------------------
//----------------------------------------------------------------


//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
          // ALL OTHER ROUTES GO TO REACT
          // All other requests serve the index.html
          app.get('*', (req, res) => {
            // res.sendFile(path.join(__dirname, 'dist/index.html'));
          });

          //ALL OTHER ROUTES
          app.get('/', async (req, res) => {
            expressListRoutes(app, {  });
            // const transporter = nodemailer.createTransport(mailConfig);
            // transporter.sendMail({
            //   from: 'omm@link868.com',
            //   to: 'dion.santana@gmail.com',
            //   subject: 'hello world!',
            //   text: 'hello world!'
            // });
            res.json({message: 'JSSWF-API-TS'});
          })

        // Current servier time route, used to sync app with server
        app.get("/api/jsswf-time", (req, res) => {
          // console.log("Current time ")
          res.json({ time: new Date().toISOString() });
        });
        //------------------------------------------------

        // here all other routes go to react
        app.use(function(req, res, next) {
          console.log("Route not found, sending 404");
          res.status(404).send('Sorry, can\'t find that');
        });
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------


//ERROR HANDLING
//................................................................
app.use(errorHandler);
//................................................................





//----------------------------------------------------------------
// START ALL APPLICATIONS
  //START THE HTTP SERVER - (remember to change in code on at top if  using HTTP)
  app.listen(PORT, () => console.log('Judiciary of Trinidad and Tobago Web Forms Portal:3000!'))
  // Start the HTTPS server - (remember to change in code on at top if  using HTTPS)
  // app.listen(PORT_SSL, () => { console.log(`Server running at https://localhost:${PORT_SSL}`);});
  // server.listen(PORT_SSL, () => {
  //   console.log(`Server running at https://localhost:${PORT_SSL}`);
  // });
//------------------------
  //START THE ADMIN SERVER
  app.listen(ADMIN_PORT, () => console.log('AdminBro is under localhost:8080/admin'))
//----------------------------------------------------------------
//----------------------------------------------------------------