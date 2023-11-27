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
import ejs from 'ejs';
import Redis from 'redis';
import { Server as SocketIO } from 'socket.io';
import { getUserByEmail, getStoredOTP, deleteStoredOTP } from './controllers/admin_users.controller.js';
import bcrypt from 'bcrypt'


// Internal libraries next

import { db, UserModel } from "./models/index.js";
import { dbConfig } from './config/db.config.js';
import { TOTPGenerator } from './utilities/TOTPGenerator.class.js';
import { mailConfig } from './config/mail.config.js';
// import { adminUser } from './controllers/admin_users.controller.js';
import { redisClient, redisStore, userChannel } from './redis/redisConfig.js'
import accessLogsRoutes from './routes/accesslogs.routes.js';
import authenticateRoutes from './routes/authenticate.routes.js';
// import configRoutes from './routes/config.routes.js';
// import accountRoutes from './routes/account.routes.js';
import adminUserRoutes from './routes/admin_users.routes.js';
// import notificationsRoutes from './routes/notifications.routes.js';
import errorLogsRoutes from './routes/errorlogs.routes.js';
import errortypesRoutes from './routes/errortypes.routes.js';
// import permissionsRoutes from './routes/permissions.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
// import rolesRoutes from './routes/roles.routes.js';
import pdfRoutes from './routes/pdf.routes.js';
import efilingRoutes from './routes/efiling.routes.js';




//internal vars
const AGENCY_NAME = process.env.REACT_APP_AGENCY_NAME
const AGENCY_CODE = process.env.REACT_APP_AGENCY_CODE
const JWT_SECRET = process.env.JWT_SECRET
const PORT = process.env.PORT || 3000
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
        console.log("Database created");
    });
  });
  // Close the connection
  //connection.end();
  db.sequelize.sync();
//----------------------------------------------------------------


//________________________________________________
// EXPRESS APP INITIALIZATION
//------------------------------------------------
  const app = express();
  // Set the view engine to ejs
  app.set('view engine', 'ejs');

  // Set the directory where the template files are located
  app.set('views', path.join(__dirname, 'views'));
  const server = http.createServer(app);



//MIDDLEWARE ----------------------------------------------------------------
//------------------------------------------------
// CORS MIDDLEWARE
//------------------------------------------------
  var allowedDomains = [
    'http://swf.ttlawcourts.org', 'https://swf.ttlawcourts.org', 
    'http://jsswf.sytes.net', 'https://jsswf.sytes.net', 
    'http://localhost:3000', 'https://localhost:3000',
    'http://localhost:5173', 'https://localhost:5173',
    'http://localhost:8080', 'https://localhost:8080',
    'http://192.168.100.149:5173'
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
      methods: ["GET", "POST"],
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
     app.use(session({
      store: redisStore,
      secret: JWT_SECRET, // Replace with a strong secret
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true, // Mitigate XSS attacks
        maxAge: 1000 * 60 * 60 * 24 // 24 hours (for example)
      }
    }));
  //------------------------------------------------
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


  //----------------------------------------------------------------
  //----------------------------------------------------------------

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
      console.log(req.session.otp_user)

      if (req.session.otp_user == {}) {
        res.redirect('/admin/login'); // Replace '/login' with your login route
      }

      const uid = req?.session?.otp_user?.id || ""
      const email = req?.session?.otp_user?.email || ""
      const { otpCode } = req.body;      
      console.log(otpCode);
      try {
          console.log("incoming: ", otpCode);
          const keyToget = `otp:${req.session.id}`;
          const storedOTP = await getStoredOTP(keyToget, otpCode);
          const theStoredOTP = `${storedOTP?.code || ""}`;
          console.log("stored otp: ", theStoredOTP);

          // Initialize incorrect attempts counter if it does not exist
          if (!req.session.incorrectOtpAttempts) {
            req.session.incorrectOtpAttempts = 0;
          }

          if (theStoredOTP !== `${otpCode}`) {
            req.session.incorrectOtpAttempts += 1;
            if (req.session.incorrectOtpAttempts >= 3) {
              // Reset counter and redirect to login
              req.session.incorrectOtpAttempts = 0;
              //remove otp_user form session
              req.session.otp_user = {};
              res.redirect('/admin/login'); // Replace '/login' with your login route
              return;
            }
            message = ``;
            error = `OTP Code is incorrect. Please try again`;
            console.log("OTP Code Incorrect")
            res.render('otp', { error: error, message: message });
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
            res.redirect('/admin'); // Redirect to the AdminBro dashboard
          }
      } catch (error) {
        res.render('otp', { error: `OTP Code is incorrect. Please try again`, message: "" });
      }
    });

    customAdminRouter.post('/ttps/admin/login', async (req, res) => {
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
          if (!user && !user.dataValues && !user.dataValues.password && !user.dataValues.email) {
              res.status(404).json({ status: 'error', message: "User not found" });
              return;
          }
          // console.log(user.dataValues);

          const storedPassword = user?.dataValues?.password || "";
          const passwordMatch = await bcrypt.compare(plainTextPassword, storedPassword);
          if (passwordMatch) {
              //the session .adminUser must not be saved until final login step
              req.session.otp_user = {
                id: user?.dataValues?.id || "", // or any identifier you use for the user
                email: user.email, // or username, depending on your system
              };

              console.log("Found a match");
              try {
                  
                var message = `A verification code has just been sent to your registered email address. 
                   Please enter this code in the box below to confirm your login.`;
                const totp = new TOTPGenerator();
                  await totp.generateOTP(req.session.id, user.dataValues.email);
                  // res.render('otp', { message: message }); // Render a page for OTP input
                  res.render('otp', { error: ``, message: message });
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


    //Role based access control
    const canModifyUsers = (currentAdmin) => {
      return currentAdmin && (currentAdmin.role === 'superadmin' || currentAdmin.role === 'admin');
    };
    const canCreateAdmins = (currentAdmin) => {
      return currentAdmin && currentAdmin.role === 'superadmin';
    };//........................................................


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
      }],
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
    });
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
      methods: ["GET", "POST"],
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
    // ++++++++++++++++++++++++++++++++++++++++++
    accessLogsRoutes(app);
    authenticateRoutes(app);
    pdfRoutes(app);
    efilingRoutes(app);
    // configRoutes(app);
    // accountRoutes(app);
    // adminUserRoutes(app);
    // notificationsRoutes(app);
    errorLogsRoutes(app);
    errortypesRoutes(app);
    // permissionsRoutes(app);
    // rolesRoutes(app);
    submissionsRoutes(app);
    // ++++++++++++++++++++++++++++++++++++++++++

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

    //ROUTE TO FORM SCHEMAS
      app.post('/register', async (req, res) => {
        let data = req.body;    
        let new_user = await User.create({
          username: 'janedoe',
          birthday: new Date(1980, 6, 20),
        });
        
        const users = await User.findAll();    
        res.send(data);

      });



      //----------------------------------------------------------------
      //----------------------------------------------------------------
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
// START ALL APPLICATIONS
  //START THE SERVER
  app.listen(PORT, () => console.log('Judiciary of Trinidad and Tobago Web Forms Portal:3000!'))
  //START THE ADMIN SERVER
  app.listen(ADMIN_PORT, () => console.log('AdminBro is under localhost:8080/admin'))
//----------------------------------------------------------------
//----------------------------------------------------------------