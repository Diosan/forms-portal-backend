const fs = require("fs/promises");
const express = require('express');
const cors = require('cors');
const _= require("lodash");
const { v4: uuid } = require("uuid");


const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.get('/schema', function (req, res) {
 
  res.json({
    title: 'Todo',
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', title: 'Title', default: 'A new task' },
      done: { type: 'boolean', title: 'Done?', default: false },
    },
  });

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});