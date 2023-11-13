const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const AccessLog = sequelize.define("accesslogs", {
    id:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_agent: {
      type: Sequelize.STRING,
    },
    referer: {
      type: Sequelize.STRING,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    socket_ip: {
      type: Sequelize.STRING,
    },
    host: {
      type: Sequelize.STRING,
    }
  });

  return AccessLog;
};