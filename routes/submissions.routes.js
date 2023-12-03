module.exports = app => {
    const submissions = require("../controllers/submissions.controller");
    var router = require("express").Router();
    
    // Retrieve all submissions
    router.get("/", submissions.findAll);
    // Retrieve one user
    router.get("/:id", submissions.findOne);
    // Authenticate User
    router.post("/auth/verify", submissions.authenticateUser);
    // Create a new submission
    router.post("/", submissions.create);
    // Create a new submission
    router.post("/indictable", submissions.createIndictable);
    // Update a new user
    router.post("/update", submissions.update);
    // Reset Password
    router.post("/password/reset", submissions.resetPassword);
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

    router.post('/save_accused', submissions.saveAccused);
  
    router.post('/update_title', submissions.updateTitle);

    router.post('/update_complainant', submissions.updateComplainant);
   
    router.get('/accuseds/:id', submissions.accuseds);

    router.post('/request_signature', submissions.requestSignature);

    router.post('/sign_indictable/:id', submissions.signIndictable);

    app.use('/api/submissions', router);
  };