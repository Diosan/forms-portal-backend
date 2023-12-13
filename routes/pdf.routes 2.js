
import express from "express";

import {generatePdf, incomingPDF, convertHtmlPdf, convertWithPuppeteer} from "../controllers/pdf.controller.js";

export default function(app) {
  
  const router = express.Router();

  // Create PDF File
  router.post("/generate", generatePdf);

  // Handle incoming PDF files -- can be used asa plan B
  router.post("/incoming", incomingPDF);

  // Convert HTML to PDF
  router.post("/convert", convertHtmlPdf);

  // Convert Puppeteer
  router.post("/puppeteer", convertWithPuppeteer);

  app.use('/api/pdf', router);
};