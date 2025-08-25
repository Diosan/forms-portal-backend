

import { DataTypes } from "sequelize";

export default (sequelize) => {
    const AccessLog = sequelize.define("accesslogs", {

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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    socket_ip: {
      type: DataTypes.STRING,
    },
    host: {
      type: DataTypes.STRING,
    }
  });

  return AccessLog;
};