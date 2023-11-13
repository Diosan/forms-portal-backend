const db = require("../models");
const fs = require("fs");
const formidable = require('formidable')
const dbConn = require("../config/db.config")
var mysql = require('mysql2');
const ErrorType = db.errortypes;
const { Op } = require("sequelize");




//**************** */
exports.findAll = (req, res) => {
  var sortObject = {};
  var filterObject = {};
  var stype = req.query.sort_field
  var sdir = req.query.sort_order
  //sortObject[stype] = sdir;
  filterObject = req.query.filter;
  var page = req.query.page
  var filter = req.query.filter ? req.query.filter : ""
  var limit = req.query.perPage
  var myFilter = req.query.q?req.query.q:"";

  

  ErrorType.findAndCountAll()
    .then(data => { 
      let x = data.rows.length;
      console.log("ERROR TYPES" + x)
      ErrorType.findAndCountAll({
          offset: (page - 1) * limit,
          limit: limit * 1,
          order: [
            [stype, sdir],
          ]
      })
      .then(json => {
          let res_header = {"content-range": "posts 0-"+limit+"/"+x}
          console.log(">>>>>>")
          res.header(res_header);
          res.send(json.rows);
        })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Error Types."
        });
      });
    })
};

exports.findOne = (req, res) => {
  const id = req.params.id;
  console.log(id);
  ErrorType.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Error Type with id=" + id
      });
    });
};



exports.create = (err_data) => {
    if (!req)
    {
      return;
    }
    const newTypeEntry = {
      err_message: (req.headers.err_message) ? req.headers.err_message : "",
      error_desc: (req.headers.error_desc) ? req.headers.error_desc : "",
    };
    // Save Type in the database
    ErrorType.create(newTypeEntry)
      .then(data => {
        console.log(data);
        return;
      })
      .catch(err => {
        return;
      });
  };



