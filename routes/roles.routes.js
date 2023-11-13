module.exports = app => {
  const roles = require("../controllers/roles.controller.js");
  var router = require("express").Router();
  
  // Retrieve all roles
  router.get("/",roles.findAll);
  // Retrieve one roles
  router.get("/:id",roles.findOne);
  // Create a new roles
  router.post("/",roles.create);
  // Update a new roles
  router.put("/:id",roles.update);
  // Delete a roles
  router.delete("/:id",roles.delete);


 
  app.use('/api/roles', router);
};