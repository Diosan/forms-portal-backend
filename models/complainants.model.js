

import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Complainant = sequelize.define("complainants", {
    //   id: {
    //     type: DataTypes.UUID,
    //     defaultValue: DataTypes.UUIDV4,
    //     primaryKey: true,
    //     unique: true
    //   },
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        agency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        regNum: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Complainant.associate = function (models) {
        Item.belongsTo(models.submission);
    };

    return Complainant;
};