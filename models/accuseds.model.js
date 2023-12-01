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
        },
        tntNational:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: true
        },
        tntResident:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: true
        },
        otherNational:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: true
        },
        otherResident:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: true
        },
        otherNationalCountry:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: true
        },
        otherResidentCountry:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: true
        },
        identification:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: true
        },
        gender:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: true
        },
        adulthood:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: true
        },
        previousCriminalRecord:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: true
        },
        dateOfBirth:{
          type: Sequelize.DataTypes.DATEONLY, 
          allowNull: true
        },
        relatedMatters:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: true
        }
    });

    Accused.associate = function (models) {
        Accused.belongsTo(models.submission);
    };

    return Accused;
}