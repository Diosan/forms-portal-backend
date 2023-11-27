
import express from "express";

import {generatePdf} from "../controllers/pdf.controller.js";

export default function(app) {
  
  const router = express.Router();

  // Create PDF File
  router.post("/generate", generatePdf);

  app.use('/api/pdf', router);
};