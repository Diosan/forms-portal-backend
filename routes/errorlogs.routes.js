module.exports = app => {
    const errorlogs = require("../controllers/errorlogs.controller.js");
    var router = require("express").Router();

    // Files ***********************************
        // Retrieve all Log Entries
        router.get("/", errorlogs.findAll); 
        // Retrieve one Error Log
        router.get("/:id", errorlogs.findOne);
        //Create a new Log Entries
        router.post("/", errorlogs.create);
        // Update Log Entry
        router.put("/:id", errorlogs.update);
        // Delete a Log Entry
        router.delete("/:id", errorlogs.delete);

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
    app.use('/api/logs/error', router);

  };