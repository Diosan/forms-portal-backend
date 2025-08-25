import {findAll, findOne, create, update, del

} from "../controllers/permissions..controller.js";
import express from "express";

export default function(app) {
  const router = express.Router();
    
    // Retrieve all permissions
    router.get("/", findAll);
    // Retrieve one permission
    router.get("/:id", findOne);
    // Create a new permission
    router.post("/", create);
    // Update a new permission
    router.put("/:id", update);
    // Delete a permission
    router.delete("/:id", del);


   
    app.use('/api/permissions', router);
  };