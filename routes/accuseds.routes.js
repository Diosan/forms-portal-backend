import {saveCharge, charges, saveConviction, convictions, savePending, pendings, findOne, saveRelatedMatter, relateds

} from "../controllers/accuseds.controller.js";
import express from "express";

export default function(app) {
    const router = express.Router();
    router.get('/:id', findOne);

    router.get('/charges/:id', charges);

    router.get('/charges/:id', charges);

    router.post('/charges', saveCharge);

    router.get('/pendings/:id', pendings);

    router.post('/pendings', savePending);

    router.get('/convictions/:id', convictions);

    router.post('/convictions', saveConviction);

    router.post('/relateds', saveRelatedMatter);

    router.get('/relateds/:id', relateds);

    app.use('/api/accuseds', router);

};