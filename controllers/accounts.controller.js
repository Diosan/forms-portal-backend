const db = require("../models/index");
const Account = db.accounts;
const { Op } = require("sequelize");


// Create and Save a new Account
export const create = (req, res) => {
  // Validate request
  if (!req.body.userId) {
    res.status(400).send({
      message: "userId cannot be empty!",
    });
    return;
  }

  // Create a Account
  const account = {
    userId: req.body.userId,
    bankOneId: req.body.bankOneId,
    bankTwoId: req.body.bankTwoId,
    bankThreeId: req.body.bankThreeId,
    bankFourId: req.body.bankFourId,
    bankFiveId: req.body.bankFiveId,
    verified: req.body.verified,
    status: req.body.status,
    receive_notifications: req.body.receive_notifications,
    receive_messages: req.body.receive_messages,
  };

  // Save Account in the database
  Account.create(account)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Account.",
      });
    });
};

// Retrieve all Accounts from the database.
export const findAll = (req, res) => {
  const userId = req.query.userId;
  var condition = userId ? { userId: { [Op.like]: `%${userId}%` } } : null;

  Account.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving accounts.",
      });
    });
};

// Find a single Account with an id
export const findOne = (req, res) => {
  const id = req.params.id;

  Account.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Account with id=" + id,
      });
    });
};

// Update a Account by the id in the request
export const update = (req, res) => {
    const id = req.params.id;

    Account.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Account was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Account with id=${id}. Maybe Account was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Account with id=" + id
            });
        });
};

export const del = (req, res) => {
    const id = req.params.id;
  
    Account.destroy({
        where: { id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({
                message: "Account was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Account with id=${id}. Maybe Account was not found!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "Could not delete Account with id=" + id
        });
    });
};

