
import express from "express";

import {sendPdfToEfiling} from "../controllers/efiling.controller.js";

export default function(app) {
  
  const router = express.Router();

  // Send PDF to Efiling
  router.post("/", sendPdfToEfiling);
  app.use('/api/efiling', router);
};