const db = require("../models/index");
const formidable = require('formidable')
const AdminUser = db.admin_users;
const { Op } = require("sequelize");

// create a new user
exports.create = (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(fields.password)
        //return
        const { firebaseId, username, password, fullname, firstName, middleName, lastName, email, address, phone, role } = fields;
        AdminUser.create({
            firebaseId: firebaseId,
            username: username,
            password: password,
            fullname: fullname,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            email: email,
            address: address,
            phone: phone, 
            role: role
        })
            .then(user => {
                res.status(200).send({ message: "User created successfully!" });
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });
    });
};

// retrieve all users
exports.findAll = (req, res) => {
    AdminUser.findAll()
        .then(users => {
            res.status(200).send(users);
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

// find a user by id
exports.findOne = (req, res) => {
    const id = req.params.id;
    AdminUser.findByPk(id)
        .then(user => {
            if (!user) {
                res.status(404).send({ message: "User not found." });
                return;
            }
            res.status(200).send(user);
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });
    };
    
    // update a user by id
    exports.update = (req, res) => {
        const id = req.params.id;
        const form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            const { firebaseId, username, password, fullname, firstName, middleName, lastName, email, address, phone, role } = fields;
            AdminUser.update({
                firebaseId: firebaseId,
                username: username,
                password: password,
                fullname: fullname,
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                email: email,
                address: address,
                phone: phone,
                role: role
            }, {
                where: { id: id }
            })
                .then(() => {
                    res.status(200).send({ message: "User updated successfully." });
                })
                .catch(err => {
                    res.status(500).send({ message: err.message });
                });
        });
    };
    
    // delete a user by id
    exports.delete = (req, res) => {
        const id = req.params.id;
        AdminUser
        .destroy({
            where: { id: id }
        })
            .then(num => {
                if (num == 1) {
                    res.status(200).send({ message: "User deleted successfully!" });
                } else {
                    res.status(404).send({ message: "User not found." });
                }
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });
    };
    