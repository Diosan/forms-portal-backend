const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {

    const Conviction = sequelize.define("convictions", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
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
                                         
    return Conviction;
}