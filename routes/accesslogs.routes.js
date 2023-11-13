module.exports = app => {
    const accesslogs = require("../controllers/accesslogs.controller.js");
    var router = require("express").Router();

    // Files ***********************************
        // Retrieve all Log Entries
        router.get("/", accesslogs.findAll); 
        //Create a new Log Entries
        router.post("/", accesslogs.create);
  
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
    app.use('/api/logs/access', router);

  };