const {DataTypes} = require("sequelize");
const bcrypt = require('bcrypt');
module.exports = (sequelize, Sequelize) => {
    const AdminUser = sequelize.define("admin_users", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true
      },
      firebaseId: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: bcrypt.hashSync('0nMym@rk!@', 8),
        set(value) {
          this.setDataValue('password', bcrypt.hashSync(value, 8));
        }
      },
      username: {               //use email address
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING(30),
      },
      middleName: {
        type: Sequelize.STRING(30),
      },
      lastName: {
        type: Sequelize.STRING(30),
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          is: /^\+(?:[0-9] ?){6,14}[0-9]$/
        },
      },
      role:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    },
    {
      hooks: {
        beforeCreate: (user, options) => {
            if (!user.password) {
                user.password = bcrypt.hashSync("password", 8);   //sets a default password for the user
            } else {
                user.password = bcrypt.hashSync(user.password, 8);
            }
        }
      }
    });
  
    return AdminUser;
  };