    import {findAll, findOne, authenticateUser, create, update, del, resetPassword,
      updateMessage, forgotPasswordRequest, handlePasswordForgotPage, resetPasswordFromEmail

    } from "../controllers/users.controller.js";
    import express from "express";
    
    export default function(app) {
      const router = express.Router();

    
    // Retrieve all users
    router.get("/", findAll);
    // Retrieve one user
    router.get("/:id", findOne);
    // Authenticate User
    router.post("/auth/verify", authenticateUser);
    // Create a new user
    router.post("/", create);
    // Update a new user
    router.put("/:id", update);
    // Reset Password
    // router.put("/password/reset", resetPassword);
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
  
  
   
    app.use('/api/users', router);
  };