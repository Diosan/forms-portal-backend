
import {bulkUploadUsers} from "../controllers/ttps_admin.controller.js";
import express from "express";

export default function(app) {
  
  const router = express.Router();
  
  // Login a user
  router.post("/upload/bulk", bulkUploadUsers);

  app.use('/api/ttps/admin', router);
};