import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Permission = sequelize.define("permissions", {


      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      permissions: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      selectable:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // createdAt: {
      //   type: Sequelize.DATE
      // },
      // updatedAt: {
      //   type: Sequelize.DATE
      // }
      
    });
  
    return Permission;
  };