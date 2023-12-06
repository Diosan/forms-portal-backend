  import {findAll, findOne, authenticateUser, create, update, del, resetPassword,
    updateMessage, forgotPasswordRequest, handlePasswordForgotPage, resetPasswordFromEmail,
    saveComplainant, updateTitle, updateComplainant, saveAccused, accuseds, requestSignature, createIndictable, signIndictable, complainantSign
  } from "../controllers/submissions.controller.js";
  import express from "express";
  
  export default function(app) {
    const router = express.Router();
    
    // Retrieve all submissions
    router.get("/", findAll);
    // Retrieve one user
    router.get("/:id", findOne);
    // Authenticate User
    router.post("/auth/verify", authenticateUser);
    // Create a new submission
    router.post("/",  create);
    // Create a new submission
    router.post("/indictable",  createIndictable);
    // Update a new user
    router.post("/update",  update);
    // Reset Password
    router.post("/password/reset",  resetPassword);
    // Update Message
    router.put("/message/add", updateMessage);
    // User forgot Password
    router.post("/password/forgotPasswordRequest", forgotPasswordRequest);
    // User forgot Password
    router.get("/password/new", handlePasswordForgotPage);
    // User Password reset from email
    router.post("/password/resetPasswordFromEmail", resetPasswordFromEmail);
    // Delete a user
    router.delete("/:id", del);

    router.post('/saveComplainant', saveComplainant);

    router.post('/save_accused', saveAccused);
  
    router.post('/update_title', updateTitle);

    router.post('/update_complainant', updateComplainant);
   
    router.get('/accuseds/:id', accuseds);

    router.post('/request_signature', requestSignature);

    router.post('/sign_indictable/:id',  signIndictable);

    router.post('/complainant_sign', complainantSign);

    app.use('/api/submissions', router);
  };