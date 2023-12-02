const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const Charge = sequelize.define("charges", {
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
        name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        ICCS: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        UNODC: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        counts: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        },
        particulars: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        dateOfOffence: {
          type: Sequelize.DataTypes.DATEONLY,
          allowNull: true
        }
    });

    // Charge.associate = function (models) {
    //     Complainant.belongsTo(models.submission);
    // };

    return Charge;
};