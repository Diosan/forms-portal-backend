const db = require("../models/index");
const Permission = db.permissions;
const Op = db.Sequelize.Op;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const yourPassword = 'pass';
//const someOtherPlaintextPassword = 'not_bacon';
const JWT_SECRET = process.env.JWT_SECRET;

//******************
//ADMIN ************

//**************** */



//**************** */
exports.findAll = (req, res) => {
  console.log("+++++++++++++++++++++++++++");
  console.log(req.query)
  console.log("+++++++++++++++++++++++++++");
    var sortObject = {};
    var filterObject = {};
    var stype = req.query.sort_field
    var sdir = req.query.sort_order
    sortObject[stype] = sdir;
    filterObject = req.query.filter;
    var page = req.query.page
    var filter = req.query.filter ? req.query.filter : ""
    var limit = req.query.perPage?req.query.perPage:100

    var myFilter = ""
    if(req.query.q != "")
    {
      myFilter = req.query.q;
    }


  //Permission.findAll()
  Permission.findAndCountAll({
    where: {
      selectable:{
      [Op.eq]:1
    },},
  })
    .then(data => {
      let x = data.rows.length;
      //console.log(x);

      Permission.findAndCountAll({
        where: {
          selectable:{
          [Op.eq]:1
        },},
      })
      .then(json => {
      let res_header = {"content-range": "posts 0-"+limit+"/"+x}
      console.log(">>>>>>")
      //console.log(json.rows)
      console.log(">>>>>>")
      res.header(res_header);
      res.send(json.rows);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Error"
      });
    });
});
};



exports.findOne = (req, res) => {
  const id = req.params.id;
  console.log(id);
  Permission.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Permission with id=" + id
      });
    });
};


exports.create = async (req, res) => {
  // Validate request
  if (!req.body.role)
  {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
    // Create a Permission
    const permission = {
      role: req.body.role,
      description: req.body.description,
    };
    // Save Permission in the database
    Permission.create(permission)
      .then(data => {
        console.log(data);
        //return
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Permission."
        });
      });

  
    
};


exports.update = async (req, res) => {
  console.log(req.body)
  // Validate request
  if (!req.body.role)
  {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  const id = req.params.id;
  //console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")
  //console.log(req.body)
  //console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")

  
  const permission ={
    id: req.body.id,
    role: req.body.id,
    description: req.body.description,
  }

  Permission.update(permission,
    {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Permission was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Permission with id=${id}. Maybe Permission was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Permission with id=" + id
      });
    });
};


exports.delete = (req, res) => {
  console.log("YYYYYYYY&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  console.log(req.params.id)
  console.log("YYYYYYYY&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  const id = req.params.id;

  Permission.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Permission was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Permission with id=${id}. Maybe Permission was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Permission with id=" + id
      });
    });
};


exports.findAllPublished = (req, res) => {
  Permission.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving permissions."
      });
    });
};