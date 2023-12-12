    import { resetPassword, 
        forgotPasswordRequest,
        handlePasswordReset
    } from "../controllers/password.controller.js";
    import express from "express";
    
    export default function(app) {
      const router = express.Router();

    // Reset Password
    router.get("/new", resetPassword);

    // Incoming request to verify the password reset before sending the user the correct page
    router.post("/new/:token", forgotPasswordRequest);
    
    // Validate Reset Token, Reset password, Remove token form database
    router.put("/new", handlePasswordReset);


    // User forgot Password
    // router.put("/password/new", handlePasswordForgotPage);
    // User Password reset from email
    // router.post("/password/resetPasswordFromEmail", resetPasswordFromEmail);
    // Delete a user
    // router.delete("/:id", del);
  
  
   
    app.use('/password', router);
  };