module.exports = app => {
  const account = require("../controllers/accounts.controller.js");
  var router = require("express").Router();
  
  // Create a new account
  router.post('/', account.create);

  // Get all accounts
  router.get('/', account.findAll);

  // Get a single account by ID
  router.get('/:id', account.findOne);

  // Update a account by ID
  router.put('/:id', account.update);

  // Delete a account by ID
  router.delete('/:id', account.delete);
 
  app.use('/api/account', router);
};