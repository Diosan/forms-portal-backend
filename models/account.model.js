const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const Account = sequelize.define("account", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      bankOneId:{
        type: Sequelize.INTEGER,
      },
      bankTwoId:{
        type: Sequelize.INTEGER,
      },
      bankThreeId:{
        type: Sequelize.INTEGER,
      },
      bankFourId:{
        type: Sequelize.INTEGER,
      },
      bankFiveId:{
        type: Sequelize.INTEGER,
      },
      verified:{
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      receive_notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      receive_messages: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }
    });
    return Account;
  };