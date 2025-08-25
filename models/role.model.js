import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Role = sequelize.define("role", {


    id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    roleLabel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleDescription: {
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

  return Role;
};