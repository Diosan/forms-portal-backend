const fs = require("fs/promises");
const express = require('express');
const cors = require('cors');
const db_conf = require('./config/db.config')

const _= require("lodash");
const { v4: uuid } = require("uuid");
const { Sequelize, DataTypes } = require('sequelize');

const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroSequelize = require('@admin-bro/sequelize')
AdminBro.registerAdapter(AdminBroSequelize)


const db = require("./models");
const mysql = require("mysql2");
const connection =  mysql.createConnection({
  host: db_conf.HOST,
  user: db_conf.USER,
  password: db_conf.PASSWORD,
});

//________________________________________________
// DATABASES
//------------------------------------------------
// import databases and firebase database
// create the mysql database if it doesn't already exist
// const firebase_db = getFirestore(fireapp);     
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


const app = express();

const adminBro = new AdminBro({
  databases: [db],
  rootPath: '/admin',
})

const router = AdminBroExpress.buildRouter(adminBro)

app.use(adminBro.options.rootPath, router)

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.get('/schema/:schemaId', async (req, res) => {

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  let schemaId = req.params.schemaId

  console.log('schemaId: ' + schemaId)

  const form_schema_file = await fs.readFile('./forms/' + schemaId + '.json');
  const form_schema = JSON.parse(form_schema_file);

  res.json(form_schema);


});

// Admin Bro listening
app.listen(8080, () => console.log('AdminBro is under localhost:8080/admin'))
// Server listening
app.listen(3000, () => console.log('Judiciary of Trinidad and Tobago Web Forms Portal-3000!'))