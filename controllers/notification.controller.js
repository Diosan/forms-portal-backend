const db = require("../models");
const Notification = db.notifications;
const User = db.users;
const fs = require('fs');
const emitter = require('socket.io-emitter')({ host: 'localhost', port: 6379 });
const { redisClient, userChannel } = require('../app');
const io = require('socket.io-client');

const socket = io.connect('http://localhost:4001');

async function sendPrivateMessage(userId, privateMessage) {
  const channel = userChannel(userId);
    console.log(privateMessage)
    console.log(userId)
    socket.emit('privateMessage', channel, privateMessage);

}

// Create a new notification
exports.personal = async (req, res) => {
  console.log("-------------- ",req.body)
  try {
    // Validate request
    if (!req.body.message || !req.body.users) {
      res.status(400).send({ message: "Message or Users cannot be empty!" });
      return;
    }

    const message = req.body.message
    const users = await User.findAll({
      where: {
        userId: req.body.users // array of user IDs
      }
    });

    // Create a new notification and associate it with the users
    const newNotification = await Notification.create({
      message: req.body.message
    });

    await newNotification.addUsers(users);

    console.log(req.body)





    // Create a notification
    // const notification = {
    //   content: req.body.content,
    //   read: false
    // };

    // Save notification in the database
    // const savedNotification = await Notification.create(notification);
    // console.log(savedNotification.createdAt);
    

    // Emit private message to user's socket
    // sendPrivateMessage(user, {"message":message, "msgid": savedNotification.msgId})
    // emitter.to(socketId).emit('privateMessage', req.body.content);

    res.status(200).send({ message: "Personal Notification sent!" });
  } catch (err) {
    console.error('Error sending personal notification', err);
    res.status(500).send({
      message: "Some error occurred while creating the notification."
    });
  }
};




// Create a System Alert
exports.createSystemAlert = (req, res) => {
  // Validate request
  if (!req.body.content) {
    res.status(400).send({ message: "Message or users cannot be empty!" });
    return;
  }

  console.log("Creating System Alert") 
  // Create a notification
  const notification = {
    content: req.body.content,
    read: false
  };

  emitter.emit('notifyAlert', notification.content); // Emit the notifyAlert event with the notification content
  res.status(200).send({ message: "Sending notification to the emitter service." });
};


// Create a System Alert
exports.createUserBroadcastNotification = (req, res) => {
  // Validate request
  if (!req.body.content) {
    res.status(400).send({ message: "Message or users cannot be empty!" });
    return;
  }
  console.log("Creating Usr broadcast")
  // Create a notification
  const notification = {
    content: req.body.content,
    read: false
  };
};
















// Create a new notification
exports.sendMany = (req, res) => {
  

};




// Retrieve all notifications for a user
exports.findAll = (req, res) => {
  const userId = req.params.userId;

  Notification.findAll({ where: { userId: userId } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving notifications."
      });
    });
};

// Update all unread notifications for a user to "read"
exports.updateAllUnread = (req, res) => {
  const userId = req.params.userId;

  Notification.update({ read: true }, { where: { userId: userId, read: false } })
    .then(num => {
      if (num[0] === 0) {
        res.send({ message: "No notifications to update." });
      } else {
        res.send({ message: `${num[0]} notifications were updated.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while updating notifications."
      });
    });
};

// Delete all notifications for a user
exports.deleteAll = (req, res) => {
  const userId = req.params.userId;

  Notification.destroy({ where: { userId: userId } })
    .then(num => {
      if (num === 0) {
        res.send({ message: "No notifications to delete." });
      } else {
        res.send({ message: `${num} notifications were deleted.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while deleting notifications."
      });
    });
};

