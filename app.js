const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const cors = require('cors');
const db_conf = require('./config/db.config')
const _= require("lodash");
const { v4: uuid } = require("uuid");
const { Sequelize, DataTypes } = require('sequelize');
const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroSequelize = require('@admin-bro/sequelize')
const db = require("./models/index");
const mysql = require("mysql2");
const winston = require('winston');
const fs = require('fs');
const expressListRoutes = require('express-list-routes');


//USED TO GENERATE A NEW SECRET
// const crypto = require('crypto');
// const secret = crypto.randomBytes(1024).toString('hex');
// console.log(secret); 
//-----------------------------------------------------





//________________________________________________
// REDIS
//------------------------------------------------
  const redis = require('redis');
  const redisAdapter = require('socket.io-redis');
  const emitter = require('socket.io-emitter')({ host: 'localhost', port: 6379 });
  const redisURL = 'redis://localhost:6379';
  const client = redis.createClient({
    socket: {
      host: 'localhost',
      port: '6379'
    }
  });
  client.on('error', err => {
    console.log('Error conneting to Redis ' + err);
  });

  const userChannelPrefix = 'user:';
  const userChannel = (userId) => userChannelPrefix + userId;

  (async () => {
    await client.connect();
  })();
  exports.redisClient = client;
  exports.userChannel = userChannel;





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
// APP - HTTP
//------------------------------------------------
  const app = express();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  // Use Morgan for logging HTTP requests
  // with the 'combined' predefined format, 
  // or customize it as needed
  //.......................................
  const http = require("http");
  const server = http.createServer(app);

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
  io.adapter(redisAdapter(redisURL));

  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  let connectedUsers = {};

  var allowedDomains = [
    'http://jsswf.ttlawcourts.org', 'https://jsswf.ttlawcourts.org', 
    'http://jsswf.sytes.net', 'https://jsswf.sytes.net', 
    'http://localhost:3000', 'https://localhost:3000',
    'http://localhost:5173', 'https://localhost:5173',
    'http://localhost:8080', 'https://localhost:8080' ];
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
//----------------------------------------------------------------
const PORT = process.env.PORT || 3000
const ADMIN_PORT = process.env.ADMIN_PORT || 8080
const indexPath  = path.resolve(__dirname, '..', 'public', 'index.html');
//----------------------------------------------------------------

//ADMINBRO
  AdminBro.registerAdapter(AdminBroSequelize)
  //________________________________________________
  const adminBro = new AdminBro({
    databases: [db],
    rootPath: '/admin',
  })
  const router = AdminBroExpress.buildRouter(adminBro)
  app.use(adminBro.options.rootPath, router)
//----------------------------------------------------------------
//----------------------------------------------------------------

//----------------------------------------------------------------
//----------------------------------------------------------------
//CORS
  app.use(cors({
    origin: 'http://localhost:5173'
    // origin: 'http://jsswf.sytes.net:5173'
  }));
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//ROUTES
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
    // ++++++++++++++++++++++++++++++++++++++++++


app.get('/', async (req, res) => {
  expressListRoutes(app, {  });
  res.json({message: 'JSSWF-API'});
})


//----------------------------------------------------------------
//----------------------------------------------------------------
//ROUTE TO FORM SCHEMAS
  app.get('/schema/:schemaId', async (req, res) => {
    // try {
    //   await Sequelize.authenticate();
    //   console.log('Connection has been established successfully.');
    // } catch (error) {
    //   console.error('Unable to connect to the database:', error);
    // }
    let schemaId = req.params.schemaId
    console.log('schemaId: ' + schemaId)
    const form_schema_file = await fs.readFileSync('./forms/' + schemaId + '.json');
    const form_schema = JSON.parse(form_schema_file);
    res.json(form_schema);
  });


//----------------------------------------------------------------
//----------------------------------------------------------------
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
// START ALL APPLICATIONS
  app.listen(ADMIN_PORT, () => console.log('AdminBro is under localhost:8080/admin'))
  app.listen(PORT, () => console.log('Judiciary of Trinidad and Tobago Web Forms Portal:3000!'))
//----------------------------------------------------------------
//----------------------------------------------------------------