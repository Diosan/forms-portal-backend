import  {DataTypes} from "sequelize";

import Sequelize from 'sequelize';


const sequelize = new Sequelize(
    'jsswf_admin',
    'root',
    'Tt,7$kz,m<`9<9qs',
    {dialect: 'mysql' }
);

const Submission = sequelize.define('submissions',
    {
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'started'
        },
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          unique: true,
          autoIncrement: true
        },
    }
);


const Complainant = sequelize.define('complainants',
    {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        agency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        regNum: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);

const Accused = sequelize.define('accuseds',
    {
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
          defaultValue: true
        },
        tntResident:{
          type: DataTypes.BOOLEAN, 
          allowNull: false, 
          defaultValue: true
        },
        otherNational:{
          type: DataTypes.BOOLEAN, 
          allowNull: false, 
          defaultValue: true
        },
        otherResident:{
          type: DataTypes.BOOLEAN, 
          allowNull: false, 
          defaultValue: true
        },
        otherNationalCountry:{
          type: DataTypes.STRING, 
          allowNull: false, 
          defaultValue: ''
        },
        otherResidentCountry:{
          type: DataTypes.STRING, 
          allowNull: false, 
          defaultValue: ''
        },
        identification:{
          type: DataTypes.STRING, 
          allowNull: false, 
          defaultValue: ''
        },
        gender:{
          type: DataTypes.STRING, 
          allowNull: false, 
          defaultValue: 'Male'
        },
        adulthood:{
          type: DataTypes.STRING, 
          allowNull: false, 
          defaultValue: 'Adult'
        },
        previousCriminalRecord:{
          type: DataTypes.STRING, 
          allowNull: false, 
          defaultValue: 'Unknown'
        },
        dateOfBirth:{
          type: DataTypes.DATEONLY, 
          allowNull: true,
          defaultValue: Sequelize.NOW
        }
    }
);



const Charge = sequelize.define('charges',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ICCS: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        UNODC: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        counts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        particulars: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: ''
        },
        dateOfOffence: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          defaultValue: Sequelize.NOW
        }


    }
);

const User = sequelize.define("users", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true
    },
    
  }, {
    tableName: 'users'
  });

Submission.belongsTo(User);

User.hasMany(Submission);

Submission.hasOne(Complainant);

Complainant.belongsTo(Submission);

Submission.hasMany(Accused);

Accused.belongsTo(Submission);

Accused.hasMany(Charge);

Charge.belongsTo(Accused);

sequelize.sync({alter: true})
.then((data) => {
    console.log('Table and model synced sucessfully');
}).catch((error) => {
    console.log('Error syncing table and model', error);
})