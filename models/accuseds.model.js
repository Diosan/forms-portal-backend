

import  {DataTypes} from "sequelize";
export default sequelize => {
    const Accused = sequelize.define("accuseds", {


        firstName: {           
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {           
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {           
            type: DataTypes.STRING,
            allowNull: false
        },
        tntNational:{
          type: DataTypes.BOOLEAN, 
          allowNull: false
        },
        tntResident:{
          type: DataTypes.BOOLEAN, 
          allowNull: false
        },
        otherNational:{
          type: DataTypes.BOOLEAN, 
          allowNull: false
        },
        otherResident:{
          type: DataTypes.BOOLEAN, 
          allowNull: false
        },
        otherNationalCountry:{
          type: DataTypes.STRING, 
          allowNull: false
        },
        otherResidentCountry:{
          type: DataTypes.STRING, 
          allowNull: false
        },
        identification:{
          type: DataTypes.STRING, 
          allowNull: false
        },
        gender:{
          type: DataTypes.STRING, 
          allowNull: false
        },
        adulthood:{
          type: DataTypes.STRING, 
          allowNull: false
        },
        previousCriminalRecord:{
          type: DataTypes.STRING, 
          allowNull: false
        },
        dateOfBirth:{
          type: DataTypes.DATEONLY, 
          allowNull: true
        }
    });

    // Accused.associate = function (models) {
    //     Accused.belongsTo(models.submission);
    // };

    return Accused;
}