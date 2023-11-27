import {saveCharge, charges} from "../controllers/accuseds.controller.js";
import express from "express";

export default function(app) {
    const router = express.Router();

    router.get('/charges/:id', charges);

    router.post('/charges', saveCharge);

    app.use('/api/accuseds', router);

};