module.exports = app => {
    const errortypes = require("../controllers/errortypes.controller.js");
    var router = require("express").Router();

    // Files ***********************************
        // Retrieve all Log Entries
        router.get("/", errortypes.findAll); 
        // Retrieve one Error Log
        router.get("/:id", errortypes.findOne);
        //Create a new Log Entries
        router.post("/", errortypes.create);

  
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
    app.use('/api/logs/errortypes', router);

  };