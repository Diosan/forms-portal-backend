module.exports = app => {
    const authenticate = require("../controllers/authenticate.controller.js");
    var router = require("express").Router();

    // AUTHENTICATION ***********************************
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++Authenticate++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        //Authenticate
        router.post("/", authenticate.doNothing);
        //login
        router.post("/login", authenticate.login);
        //register
        router.post("/register", authenticate.register);
        //verify-otp
        router.post("/verify-otp", authenticate.verifyOtp);
        //Refresh Token
        router.get("/refresh-token", authenticate.refreshToken);
  
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
    app.use('/api/authenticate', router);
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  


  };