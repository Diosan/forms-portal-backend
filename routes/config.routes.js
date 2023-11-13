module.exports = app => {
    const appConfig = require("../controllers/app_configuration.controller");
    var router = require("express").Router();

    // Generate Configuration File
    router.post('/', appConfig.generateConfigFile);

    app.use('/api/appconfig', router);
};