const fs = require("fs/promises");
const express = require('express');
const cors = require('cors');
const _= require("lodash");
const { v4: uuid } = require("uuid");
const { Sequelize, DataTypes } = require('sequelize');

// Option 1: Passing a connection URI
const sequelize = new Sequelize('mysql://root:piccolo@localhost:3306/judiciary_forms') // Example for postgres

const User = sequelize.define('User', {
  // Model attributes are defined here
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING
    // allowNull defaults to true
  }
}, {
  // Other model options go here
});

const app = express();

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
 
  // res.json({
  //   title: 'Todo',
  //   type: 'object',
  //   required: ['title'],
  //   properties: {
  //     title: { type: 'string', title: 'Title', default: 'A new task' },
  //     done: { type: 'boolean', title: 'Done?', default: false },
  //   },
  // });

});

app.listen(3000, function () {
  console.log('JudiciaryTT Forms Portal Backend listening on port 3000!');
});