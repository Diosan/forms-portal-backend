import {doNothing, login, register, resendOtp, verifyOtp, refreshToken} from "../controllers/authenticate.controller.js";
import express from "express";

export default function(app) {
  const router = express.Router();

    // AUTHENTICATION ***********************************
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++Authenticate++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        //Authenticate
        router.post("/", doNothing);
        //login
        router.post("/login", login);
        //register
        router.post("/register", register);
        //verify-otp
        router.post("/verify-otp", verifyOtp);
        //resend-otp
        router.post("/resend-otp", resendOtp);
        //Refresh Token
        router.get("/refresh-token", refreshToken);
  
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
    app.use('/api/authenticate', router);
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  


  };