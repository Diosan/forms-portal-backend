const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {

    const Pending = sequelize.define("pendings", {
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
            allowNull: true
        }
    });

    // Accused.associate = function (models) {
    //     Accused.belongsTo(models.submission);
    // };
                                         
    return Pending;
}