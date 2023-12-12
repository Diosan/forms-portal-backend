import { chargeCodes } from "../controllers/codes.controller";

import express from "express";


export default function(app) {
    const router = express.Router();    

    router.get('/', chargeCodes);

    app.use('/api/codes', router);

};