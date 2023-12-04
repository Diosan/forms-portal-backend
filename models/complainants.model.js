

import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Complainant = sequelize.define("complainants", {
<<<<<<< HEAD
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
            Complainant.belongsTo(models.submission);
        };
    
        return Complainant;
=======
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
            autoIncrement: true
        },
        firstName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        agency: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        regNum: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        courtDistrict: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true
        },
        court: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true
        }
    });

    Complainant.associate = function (models) {
        Complainant.belongsTo(models.submission);
    };

    return Complainant;
>>>>>>> origin/Dion2
};