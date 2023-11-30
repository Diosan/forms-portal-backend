const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {

    const Pending = sequelize.define("pendings", {
        offence: {           
            type: Sequelize.STRING,
            allowNull: false
        },
        dateOfOffence:{
          type: Sequelize.DataTypes.DATEONLY, 
          allowNull: false
        },
        sentence: {           
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    // Accused.associate = function (models) {
    //     Accused.belongsTo(models.submission);
    // };
                                         
    return Pending;
}