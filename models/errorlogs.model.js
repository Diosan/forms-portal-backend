const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const ErrorLog = sequelize.define("errorlogs", {
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
    socket_ip: {
      type: Sequelize.STRING,
    },
    host: {
      type: Sequelize.STRING,
    },
    error_type_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    err_message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    error_desc: {
      type: Sequelize.STRING,
    },
    userId: {
      type: DataTypes.UUID,
    },
    issue_resolved: {
      type: Sequelize.BOOLEAN,
    },
    resolved_by: {
      type: Sequelize.STRING,
    },
    resolved_date: {
      type: Sequelize.DATE,
    }
  });

  return ErrorLog;
};