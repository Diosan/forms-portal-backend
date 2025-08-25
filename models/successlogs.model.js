import { DataTypes } from "sequelize";

export default (sequelize) => {
    const SuccessLog = sequelize.define("successlogs", {



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
      }
    });

    return SuccessLog;
  };