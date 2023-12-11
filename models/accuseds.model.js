import  {DataTypes} from "sequelize";
export default sequelize => {
  const Accused = sequelize.define("accuseds", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
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
      allowNull: false,
      defaultValue: 1
    },
    tntResident:{
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: 1
    },
    otherNational:{
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: 0
    },
    otherResident:{
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: 0
    },
    otherNationalCountry:{
      type: DataTypes.STRING, 
      allowNull: false,
      defaultValue: '_'
    },
    otherResidentCountry:{
      type: DataTypes.STRING, 
      allowNull: false,
      defaultValue: "_"
    },
    identification:{
      type: DataTypes.STRING, 
      allowNull: true,
      defaultValue: '_'
    },
    identificationType:{
      type: DataTypes.STRING, 
      allowNull: true,
      defaultValue: 'National ID Card'
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
      type: DataTypes.TEXT, 
      allowNull: false,
      defaultValue: 'Unknown'
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