module.exports = app => {
    const accuseds = require("../controllers/accuseds.controller");
    var router = require("express").Router();

    router.get('/charges/:id', accuseds.charges);

    router.post('/charges', accuseds.saveCharge);

    app.use('/api/accuseds', router);

};