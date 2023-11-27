
import {findAll, create, findOne, update, del, adminLogin, verifyOtp} from "../controllers/admin_users.controller.js";
import express from "express";

export default function(app) {
  
  const router = express.Router();
  
  // Retrieve all admin_users
  router.get("/", findAll);
  // Retrieve one user
  router.get("/:id", findOne);
  // Create a new user
  router.post("/", create);
  // Login a user
  router.post("/login", adminLogin);
  // Verify OTP
  router.post("/verify-otp", verifyOtp);
  // Update a new user
  router.put("/:id", update);
  // Delete a user
  router.delete("/:id", del);

  app.use('/api/admin/users', router);
};