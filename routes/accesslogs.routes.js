import {findAll, create} from "../controllers/accesslogs.controller.js";
import express from "express";

export default function(app) {
    const router = express.Router();

    // Files ***********************************
        // Retrieve all Log Entries
        router.get("/", findAll); 
        //Create a new Log Entries
        router.post("/", create);
  
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
    app.use('/api/logs/access', router);

  };

