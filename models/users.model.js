import { DataTypes } from "sequelize";

export default (sequelize) => {
    const User = sequelize.define("users", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true
      },
      agencyMemberUniqueId: { // Your unique id from your agency. eg. Regimental number
        type: DataTypes.STRING,
        allowNull: false
      },
      agencyName: { // Name of the agency. eg. TTPS
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notifications: {
        type: DataTypes.JSON,
        allowNull: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      },
      phone: {
        type: DataTypes.STRING(20),
        unique: true,
        validate: {
          is: /^\+(?:[0-9] ?){6,14}[0-9]$/
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'users'
    });

    return User;
};
