import {findAll, createSystemAlert, createUserBroadcastNotification, 
    sendMany, personal, updateAllUnread, deleteAll

} from "../controllers/notifications.controller.js";
import express from "express";

export default function(app) {
    const router = express.Router();

    // Create a new system alert
    router.post("/system/alert", createSystemAlert);

    // Create a new user broadcast notification
    router.post("/allUsers", createUserBroadcastNotification);

    // Create notification that goes to more than on user
    router.post("/manyUsers", sendMany);

    // Create notification that goes to only one user
    router.post("/personal", personal);

    // Retrieve all notifications for a user
    router.get("/:userId", findAll);

    // Update all unread notifications for a user to "read"
    router.put("/:userId", updateAllUnread);

    // Delete all notifications for a user
    router.delete("/:userId", deleteAll);

    app.use('/api/notifications', router);
};
