const db = require("../models");
const fs = require("fs");
const formidable = require('formidable')
const dbConn = require("../config/db.config")
var mysql = require('mysql2');
const ErrorLog = db.errorlogs;
const { Op } = require("sequelize");


//**************** */
exports.findAll = (req, res) => {
  //console.log(req)
  res.send()
  var sortObject = {};
  var filterObject = {};
  var stype = req.query.sort_field
  var sdir = req.query.sort_order
  //sortObject[stype] = sdir;
  filterObject = req.query.filter ? JSON.parse(req.query.filter) : {};
  var page = req.query.page
  var filter = filterObject
  var limit = req.query.perPage
  var myFilter = req.query.q?req.query.q:"";

  

  // console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`)
  // console.log(JSON.parse(JSON.stringify(filter)))
  // console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`)
  var my_error_types = ""
  //default where clause
  let where = {
    document_evrfy_number:{
      [Op.like]:`%${myFilter}%`
      },
      issue_resolved: {
        [Op.or]: [null, 0]
      } 
    }  

  my_error_types = filter.error_type_id ? filter.error_type_id : "";
  const dd = my_error_types
  console.log(dd)

  //parse the document types to fileter content per department
  if(dd)
    {
      where = {
        document_evrfy_number:{
          [Op.like]:`%${myFilter}%`
        }, 
        error_type_id: {
          [Op.like]: dd
        },
        issue_resolved: {
          [Op.or]: [null, 0]
        }
      }
    }
    

  ErrorLog.findAndCountAll(
    {where: where,
    })
    .then(data => { 
      let x = data.rows.length;
      //console.log(data); 
      ErrorLog.findAndCountAll({
          where: where,
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
            err.message || "Some error occurred while retrieving Dcouments."
        });
      });
    })
};

exports.findOne = (req, res) => {
  const id = req.params.id;
  console.log(id);
  ErrorLog.findByPk(id)
    .then(data => {
      //console.log(data);
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Document with id=" + id
      });
    });
};

exports.create = (err_data) => {
    // Validate request
    //console.log("req: " + req);
    //return
    if (!req)
    {
      return;
    }
    const ua =  req.get('user-agent') ? req.get('user-agent') : "";
    // Create a Log
    const newLogEntry = {
      user_agent: ua ? ua : "",
      referer: (req.headers.referer) ? req.headers.referer : "",
      socket_ip: (req.socket.remoteAddress) ? req.socket.remoteAddress : "",
      host: (req.headers.host) ? req.headers.host : "",
      err_message: (req.headers.err_message) ? req.headers.err_message : "",
      error_type_id: (req.headers.err_message) ? req.headers.err_message : "",
      document_name: (req.headers.document_name) ? req.headers.document_name : "",
      document_owner: (req.headers.document_owner) ? req.headers.document_owner : "",
      document_evrfy_number: (req.headers.document_evrfy_number) ? req.headers.document_evrfy_number : "",
      error_desc: (req.headers.error_desc) ? req.headers.error_desc : "",
      document_access_code: (req.headers.document_access_code) ? req.headers.document_access_code : "",
    };
    // Save Log in the database
    ErrorLog.create(newLogEntry)
      .then(data => {
        console.log(data);
        //res.send(data);
        return;
      })
      .catch(err => {
        //res.send(err)
        return;
      });
  };

exports.update = async (req, res) => {
  //console.log(req.body)
  // Validate request
  if (!req.body.issue_resolved
    || !req.body.id
    || !req.body.resolved_by
    )
  {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  const entry ={
    id: req.body.id,
    issue_resolved: req.body.issue_resolved,
    resolved_by: req.body.resolved_by,
  }
  


  //return
  ErrorLog.update(entry,
    {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Error Entry was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Error Entry with id=${id}. Maybe Error Entry was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Error entry with id=" + id
      });
    });
};


exports.delete = (req, res) => {
  // console.log("YYYYYYYY&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  // console.log(req.params.id)
  // console.log("YYYYYYYY&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  const id = req.params.id;
  // try{
    ErrorLog.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send(
            {
              status: 200,
              message: "Error was deleted successfully!"
              
          });
        } else {
          res.status(200).send({
            message: `Cannot delete Error Entry with id=${id}. Maybe Error Entry was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Error Entry with id=" + id
        });
      });
  //   }
  // catch(error){
  //   res.status(500).send({
  //     message: "Could not delete Error Entry with id=" + id
  //   });
  // }

  
};



