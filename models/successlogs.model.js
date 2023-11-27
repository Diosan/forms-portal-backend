import { DataTypes } from "sequelize";

export default (sequelize) => {
    const SuccessLog = sequelize.define("successlogs", {



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
      }
    });

    return SuccessLog;
  };