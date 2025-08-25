import {findAll, findOne, create, update, del} from "../controllers/errorlogs.controller.js";
import express from "express";

export default function(app) {
  const router = express.Router();

  
    // Files ***********************************
        // Retrieve all Log Entries
        router.get("/", findAll); 
        // Retrieve one Error Log
        router.get("/:id", findOne);
        //Create a new Log Entries
        router.post("/", create);
        // Update Log Entry
        router.put("/:id", update);
        // Delete a Log Entry
        router.delete("/:id", del);

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
    app.use('/api/logs/error', router);

  };