const db = require("../models/index");
const fs = require("fs");
const formidable = require('formidable')
const dbConn = require("../config/db.config")
var mysql = require('mysql2');
const AccessLog = db.accesslogs;




//**************** */
// exports.findAll = (req, res) => {
// AccessLog.findAndCountAll()
//     .then(data => { 
//       let x = data.rows.length;
//       console.log("ERROR TYPES" + x)
//       AccessLog.findAndCountAll({
//           offset: (page - 1) * limit,
//           limit: limit * 1,
//           order: [
//             [stype, sdir],
//           ]
//       })
//       .then(json => {
//           let res_header = {"content-range": "posts 0-"+limit+"/"+x}
//           console.log(">>>>>>")
//           res.header(res_header);
//           res.send(json.rows);
//         })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while retrieving Error Types."
//         });
//       });
//     })
// };

exports.findAll = (req, res) => {
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

  console.log(filterObject)

  console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`)
  //console.log(JSON.parse(JSON.stringify(filter)))
  console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`)
  var my_error_types = ""
  

  my_error_types = filter.error_type_id ? filter.error_type_id : "";
  const dd = my_error_types

  AccessLog.findAndCountAll()
    .then(data => { 
      let x = data.rows.length;
      AccessLog.findAndCountAll({
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


exports.create = (req, res) => {
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
    };
    // Save Log in the database
    AccessLog.create(newLogEntry)
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



