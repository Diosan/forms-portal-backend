module.exports = app => {
    const users = require("../controllers/users.controller.js");
    var router = require("express").Router();
    
    // Retrieve all users
    router.get("/", users.findAll);
    // Retrieve one user
    router.get("/:id", users.findOne);
    // Authenticate User
    router.post("/auth/verify", users.authenticateUser);
    // Create a new user
    router.post("/", users.create);
    // Update a new user
    router.put("/:id", users.update);
    // Reset Password
    router.put("/password/reset", users.resetPassword);
    // Update Message
    router.put("/message/add", users.updateMessage);
    // User forgot Password
    router.post("/password/forgotPasswordRequest", users.forgotPasswordRequest);
    // User forgot Password
    router.get("/password/new", users.handlePasswordForgotPage);
    // User Password reset from email
    router.post("/password/resetPasswordFromEmail", users.resetPasswordFromEmail);
    // Delete a user
    router.delete("/:id", users.delete);
  
  
   
    app.use('/api/users', router);
  };