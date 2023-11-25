const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {

    const Accused = sequelize.define("accuseds", {
        firstName: {           
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {           
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {           
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    Accused.associate = function (models) {
        Accused.belongsTo(models.submission);
    };

    return Accused;
}