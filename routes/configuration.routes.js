// import { modeSet } from "../controllers/configuration.controller";
import { modeSet, mode } from "../controllers/configuration.controller.js";
import express from "express";

export default function(app) {

    const router = express.Router();

    router.post('/set_mode', modeSet);
    router.get('/mode', mode);
    
    app.use('/api/configuration', router);

}
