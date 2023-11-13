  module.exports = app => {
    const permissions = require("../controllers/permissions.controller.js");
    var router = require("express").Router();
    
    // Retrieve all permissions
    router.get("/", permissions.findAll);
    // Retrieve one permission
    router.get("/:id", permissions.findOne);
    // Create a new permission
    router.post("/", permissions.create);
    // Update a new permission
    router.put("/:id", permissions.update);
    // Delete a permission
    router.delete("/:id", permissions.delete);


   
    app.use('/api/permissions', router);
  };