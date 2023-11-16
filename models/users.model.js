const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true
      },
      agencyMemberUniqueId: {           //your unique id from your agency. eg. Regimental number
        type: Sequelize.STRING,
        allowNull: false
      },
      agencyName: {                     // name of the agency. eg. TTPS
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      status:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      notifications: {
        type: DataTypes.JSON,
        allowNull: true
      },
      active:{
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
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
      },
      phone: {
        type: DataTypes.STRING(20),
        unique: true,
        validate: {
          is: /^\+(?:[0-9] ?){6,14}[0-9]$/
        },
      },
      role:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    },
    {
      tableName: 'users'
    });

    return User;
  };