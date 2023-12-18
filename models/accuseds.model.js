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
    middleName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {           
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {           
        type: DataTypes.TEXT,
        allowNull: true
    },
    addressLine1: {           
      type: DataTypes.STRING,
      allowNull: true
    },
    addressLine2: {           
      type: DataTypes.STRING,
      allowNull: true
    },
    addressLine3: {           
      type: DataTypes.STRING,
      allowNull: true
    },
    cityTown: {           
      type: DataTypes.STRING,
      allowNull: true
    },
    postalCode: {           
      type: DataTypes.STRING,
      allowNull: true
    },
    communityCode: {           
      type: DataTypes.STRING,
      allowNull: true
    },
    countryCode: {           
      type: DataTypes.STRING,
      allowNull: true
    },
    countryName: {
      type: DataTypes.STRING, // Data type of the column
      allowNull: true // Column can be null
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
      allowNull: true
    },
    otherGender:{
      type: DataTypes.STRING, 
      allowNull: true
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
    },
    aproximateAge:       {
      type: DataTypes.INTEGER, // Data type of the column
      allowNull: true // Column can be null
    },
    alias:{
      type: DataTypes.STRING, 
      allowNull: true
    },
    email:{
      type: DataTypes.STRING, 
      allowNull: true
    }
    
});

    // Accused.associate = function (models) {
    //     Accused.belongsTo(models.submission);
    // };

    return Accused;
}