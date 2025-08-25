import {generateConfigFile} from "../controllers/app_configuration.controller.js";
import express from "express";

export default function(app) {
  const router = express.Router();

    // Generate Configuration File
    router.post('/', generateConfigFile);

    app.use('/api/appconfig', router);
};

