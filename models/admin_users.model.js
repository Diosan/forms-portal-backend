

import { DataTypes } from "sequelize";

export default (sequelize) => {
    const AdminUser = sequelize.define("admin_users", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {               //use email address
        type: DataTypes.STRING(60),
        unique: true,
        allowNull: false
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING(30),
      },
      middleName: {
        type: DataTypes.STRING(30),
      },
      lastName: {
        type: DataTypes.STRING(30),
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      address: {
        type: DataTypes.STRING(300),
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          is: /^(?:\d{10}|\d{7})$/
      },
      },
      role:{
        type: DataTypes.STRING(30),
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    });
  
    return AdminUser;
  };