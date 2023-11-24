module.exports = app => {
    const submissions = require("../controllers/submissions.controller");
    var router = require("express").Router();
    
    // Retrieve all submissions
    router.get("/", submissions.findAll);
    // Retrieve one user
    router.get("/:id", submissions.findOne);
    // Authenticate User
    router.post("/auth/verify", submissions.authenticateUser);
    // Create a new user
    router.post("/", submissions.create);
    // Update a new user
    router.put("/:id", submissions.update);
    // Reset Password
    router.put("/password/reset", submissions.resetPassword);
    // Update Message
    router.put("/message/add", submissions.updateMessage);
    // User forgot Password
    router.post("/password/forgotPasswordRequest", submissions.forgotPasswordRequest);
    // User forgot Password
    router.get("/password/new", submissions.handlePasswordForgotPage);
    // User Password reset from email
    router.post("/password/resetPasswordFromEmail", submissions.resetPasswordFromEmail);
    // Delete a user
    router.delete("/:id", submissions.delete);

    router.post('/saveComplainant', submissions.saveComplainant);
  
    router.post('/update_title', submissions.updateTitle);
   
    app.use('/api/submissions', router);
  };