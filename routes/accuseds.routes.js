module.exports = app => {
    const accuseds = require("../controllers/accuseds.controller");
    var router = require("express").Router();

    router.get('/:id', accuseds.findOne);

    router.get('/charges/:id', accuseds.charges);

    router.post('/charges', accuseds.saveCharge);

    router.get('/pendings/:id', accuseds.pendings);

    router.post('/pendings', accuseds.savePending);

    router.get('/convictions/:id', accuseds.convictions);

    router.post('/convictions', accuseds.saveConviction);

    app.use('/api/accuseds', router);

};