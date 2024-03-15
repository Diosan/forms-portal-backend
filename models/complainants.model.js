

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
                unique: true,
                autoIncrement: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            middleName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true
            },
            agency: {
                type: DataTypes.STRING,
                allowNull: false
            },
            regNum: {
                type: DataTypes.STRING,
                allowNull: false
            },
            courtDistrict: {
              type: DataTypes.STRING,
              allowNull: true
            },
            court: {
              type: DataTypes.STRING,
              allowNull: true,
              defaultValue: 'High Court'
            },
            rank: {
                type: DataTypes.STRING,
                allowNull: true
            },
            unit: {
                type: DataTypes.STRING,
                allowNull: true
            }

        });
    
        Complainant.associate = function (models) {
            Complainant.belongsTo(models.submission);
        };
    
        return Complainant;
};