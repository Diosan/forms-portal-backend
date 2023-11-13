module.exports = app => {
  const admin_users = require("../controllers/admin_users.controller.js");
  var router = require("express").Router();
  
  // Retrieve all admin_users
  router.get("/", admin_users.findAll);
  // Retrieve one user
  router.get("/:id", admin_users.findOne);
  // Create a new user
  router.post("/", admin_users.create);
  // Update a new user
  router.put("/:id", admin_users.update);
  // Delete a user
  router.delete("/:id", admin_users.delete);


 
  app.use('/api/admin/users', router);
};