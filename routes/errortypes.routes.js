
import {findAll, findOne, create} from "../controllers/errortypes.controller.js";
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

  
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
    app.use('/api/logs/errortypes', router);

  };