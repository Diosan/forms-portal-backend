const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
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
        }
    });

    Complainant.associate = function (models) {
        Complainant.belongsTo(models.submission);
    };

    return Complainant;
};