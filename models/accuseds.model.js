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
          allowNull: false
        },
        tntResident:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: false
        },
        otherNational:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: false
        },
        otherResident:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: false
        },
        otherNationalCountry:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false
        },
        otherResidentCountry:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false
        },
        identification:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false
        },
        gender:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false
        },
        adulthood:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false
        },
        previousCriminalRecord:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false
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