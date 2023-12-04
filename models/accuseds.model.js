
<<<<<<< HEAD
=======
    const Accused = sequelize.define("accuseds", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          unique: true,
          autoIncrement: true
        },
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
>>>>>>> origin/Dion2

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