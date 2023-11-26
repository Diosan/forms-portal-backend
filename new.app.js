//External libraries first
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser')
const path = require('path');
const cors = require('cors');
const _= require("lodash");
const { v4: uuid } = require("uuid");
const { Sequelize, DataTypes } = require('sequelize');
const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroSequelize = require('@admin-bro/sequelize')
const mysql = require("mysql2");
const winston = require('winston');
const fs = require('fs');
const expressListRoutes = require('express-list-routes');
const nodemailer = require('nodemailer');
var session = require('express-session')
const http = require("http");
let ejs = require('ejs');
const Redis = require('redis');
const connectRedis = require('connect-redis');




//internal libraries next
const AGENCY_NAME = process.env.REACT_APP_AGENCY_NAME
const AGENCY_CODE = process.env.REACT_APP_AGENCY_CODE
const JWT_SECRET = process.env.JWT_SECRET
const PORT = process.env.PORT || 3000
const ADMIN_PORT = process.env.ADMIN_PORT || 8080
const indexPath  = path.resolve(__dirname, '..', 'public', 'index.html');
const db = require("./models/index");
const db_conf = require('./config/db.config')
const TOTPGenerator = require('./utilities/TOTPGenerator.class');
const mailConfig = require('./config/mail.config');
const Authenticate = require('./controllers/authenticate.controller');
const { redisClient, redisURL, userChannel, redisAdapter, emitter } = require('./redis/redisConfig');
const RedisStore = require('connect-redis');






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
    host: db_conf.HOST,
    user: db_conf.USER,
    password: db_conf.PASSWORD,
  });   
  // Open the connection to MySQL server
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    connection.query(`CREATE DATABASE IF NOT EXISTS ${db_conf.DB}`, function (err, result) {
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
      store: RedisStore({ client: redisClient }),
      secret: 'your-session-secret', // Replace with a strong secret
      resave: false,
      saveUninitialized: false,
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
  //----------------------------------------------------------------
  //----------------------------------------------------------------

  //________________________________________________
  //ADMINBRO MIDDLEWARE
  //------------------------------------------------
    //Custom Admin Router ------------------------------------------------
    const customAdminRouter = express.Router();
    customAdminRouter.get('/login', async (req, res) => {
      // Render custom login page (including OTP field or separate OTP page)
      res.render('login', {  });
    });

    customAdminRouter.post('/login', async (req, res) => {
      console.log(req.body)
      // Step 1: Verify username and password
        // Extract username and password from req.body
        const { username, password } = req.body;
        // Verify username and password
        const user = await Authenticate.adminLogin(username, password, AGENCY_CODE);
        if (user?.status === 'ok') {
          // Redirect to OTP input page or render it
          res.render('otp'); // Render a page for OTP input
        } else {
          // Authentication failed
          res.render('login', { error: 'Invalid username and or password. Please try again.' });
        }
      // Step 2: If correct, generate and send OTP, then render OTP input form
      // Step 3: User enters OTP, verify it
      // If all correct, establish session and redirect to AdminBro dashboard
    });

    customAdminRouter.post('/verify-otp', async (req, res) => {
      const { otp } = req.body;
      const storedOtp = req.session.otp;
      const username = req.session.username;
    
      if (otp === storedOtp) {
        // OTP is correct, log the user in and clear the OTP from the session
        req.session.otp = null;
        // Perform login logic, set user session, etc.
        loginUser(req, username);
        
        // Redirect to AdminBro dashboard or another appropriate page
        res.redirect('/admin');
      } else {
        // OTP verification failed
        res.render('otp', { error: 'Invalid OTP' });
      }
    });



  const ADMIN = {
      email: 'off_admin@link868.com',
      password: '12345678',
      role: 'admin',
    };

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
        component: AdminBro.bundle('./my-dashboard-component.jsx')
      },
      resources: [ {
          resource: db.users,
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
      rootPath: '/ttps/admin',
      assets: {
        styles: ['/admin-custom.css'], 
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
        if (ADMIN.email === email && ADMIN.password === password) {
          return ADMIN;
        }
        return null;
      },
      cookiePassword: 'session-secret',
    });
    //use this by default
    app.use(adminBro.options.rootPath, router)
    // or is using custom admin router
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
  const io = require("socket.io")(server, {
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
    require("./routes/accesslogs.routes")(app);
    require("./routes/authenticate.routes")(app);
    require("./routes/config.routes")(app);
    require("./routes/account.routes")(app);
    require("./routes/admin_users.routes")(app);
    require("./routes/notifications.routes")(app);
    require("./routes/errorlogs.routes")(app);
    require("./routes/errortypes.routes")(app);
    require("./routes/permissions.routes")(app);
    require("./routes/roles.routes")(app);
    require("./routes/users.routes")(app);
    require("./routes/submissions.routes")(app);
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