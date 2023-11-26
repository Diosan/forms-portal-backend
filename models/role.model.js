import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Role = sequelize.define("role", {


    id:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    roleLabel: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    roleDescription: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE
    },
  });

  return Role;
};