const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define('Notification', {
    msgId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  }, {
    tableName: 'notifications'
  });
    return Notification;
  };