
import {bulkUploadUsers, uploadCsvAndCreateUsers, csvTemp} from "../controllers/ttps_admin.controller.js";
import express from "express";

export default function(app) {
  
  const router = express.Router();
  
  // Login a user
  router.post("/upload/bulk", bulkUploadUsers);

  // UPLOAD Users temporary
  router.post("/upload/csvTemp", csvTemp);

  app.use('/api/ttps/admin', router);
};



