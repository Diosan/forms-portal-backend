  module.exports = app => {
    const notifications = require("../controllers/notification.controller");
    var router = require("express").Router();

    // Create a new system alert
    router.post("/system/alert", notifications.createSystemAlert);

    // Create a new user broadcast notification
    router.post("/allUsers", notifications.createUserBroadcastNotification);

    // Create notification that goes to more than on user
    router.post("/manyUsers", notifications.sendMany);

    // Create notification that goes to only one user
    router.post("/personal", notifications.personal);

    // Retrieve all notifications for a user
    router.get("/:userId", notifications.findAll);

    // Update all unread notifications for a user to "read"
    router.put("/:userId", notifications.updateAllUnread);

    // Delete all notifications for a user
    router.delete("/:userId", notifications.deleteAll);

    app.use('/api/notifications', router);
};
