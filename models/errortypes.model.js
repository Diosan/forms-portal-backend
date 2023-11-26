import { DataTypes } from "sequelize";

export default (sequelize) => {
    const ErrorType = sequelize.define("errortypes", {

    id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    err_message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    error_desc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE
    },
  });

  return ErrorType;
};