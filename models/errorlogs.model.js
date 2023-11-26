import { DataTypes } from "sequelize";

export default (sequelize) => {
    const ErrorLog = sequelize.define("errorlogs", {
    id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_agent: {
      type: DataTypes.STRING,
    },
    referer: {
      type: DataTypes.STRING,
    },
    socket_ip: {
      type: DataTypes.STRING,
    },
    host: {
      type: DataTypes.STRING,
    },
    error_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    err_message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    error_desc: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.UUID,
    },
    issue_resolved: {
      type: DataTypes.BOOLEAN,
    },
    resolved_by: {
      type: DataTypes.STRING,
    },
    resolved_date: {
      type: DataTypes.DATE,
    }
  });

  return ErrorLog;
};