import {findAll, findOne, update, del} from "../controllers/accounts.controller.js";
import express from "express";

export default function(app) {
  

  
  const router = express.Router();
  
  // Create a new account
  router.post('/', create);

  // Get all accounts
  router.get('/', findAll);

  // Get a single account by ID
  router.get('/:id', findOne);

  // Update a account by ID
  router.put('/:id', update);

  // Delete a account by ID
  router.delete('/:id', del);
 
  app.use('/api/account', router);
};