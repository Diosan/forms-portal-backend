import {findAll, findOne, create, update, del

  } from "../controllers/roles.controller.js";
  import express from "express";
  
  export default function(app) {
    const router = express.Router();
  
  // Retrieve all roles
  router.get("/",findAll);
  // Retrieve one roles
  router.get("/:id",findOne);
  // Create a new roles
  router.post("/",create);
  // Update a new roles
  router.put("/:id",update);
  // Delete a roles
  router.delete("/:id",del);


 
  app.use('/api/roles', router);
};