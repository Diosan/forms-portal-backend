const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'jsswf_admin',
    'root',
    'piccolo',
    {dialect: 'mysql' }
);

const Submission = sequelize.define('submissions',
    {
        description: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'started'
        },
        type: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'complaint_with_oath'
        },
        summaryOfEvidence: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true
        }
    }
);


const Complainant = sequelize.define('complainants',
    {
        firstName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        agency: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        regNum: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        courtDistrict: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true
        },
        court: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true
        }

    }
);

const Accused = sequelize.define('accuseds',
    {
        firstName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        tntNational:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: false, 
          defaultValue: true
        },
        tntResident:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: false, 
          defaultValue: true
        },
        otherNational:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: false, 
          defaultValue: false
        },
        otherResident:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: false, 
          defaultValue: false
        },
        otherNationalCountry:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false, 
          defaultValue: ''
        },
        otherResidentCountry:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false, 
          defaultValue: ''
        },
        identification:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false, 
          defaultValue: ''
        },
        gender:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false, 
          defaultValue: 'Male'
        },
        adulthood:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false, 
          defaultValue: 'Adult'
        },
        previousCriminalRecord:{
          type: Sequelize.DataTypes.STRING, 
          allowNull: false, 
          defaultValue: 'Unknown'
        },
        dateOfBirth:{
          type: Sequelize.DataTypes.DATEONLY, 
          allowNull: true,
          defaultValue: Sequelize.NOW
        },
        relatedMatters:{
          type: Sequelize.DataTypes.BOOLEAN, 
          allowNull: true, 
          defaultValue: false
        }
        
    }
);

const Pending = sequelize.define('pendings',
    {
      offence: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      dateOfOffence:{
        type: Sequelize.DataTypes.DATEONLY, 
        allowNull: true,
        defaultValue: Sequelize.NOW
      }
    }
);


const Conviction = sequelize.define('convictions',
    {
      offence: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      dateOfOffence:{
        type: Sequelize.DataTypes.DATEONLY, 
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
      sentence: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      }
    }

);



const User = sequelize.define("users", {
    agencyMemberUniqueId: {           //your unique id from your agency. eg. Regimental number
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    agencyName: {                     // name of the agency. eg. TTPS
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: Sequelize.DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    status:{
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    notifications: {
      type: Sequelize.DataTypes.JSON,
      allowNull: true
    },
    active:{
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: 0,
      allowNull: false
    },
    firstName: {
      type: Sequelize.DataTypes.STRING(30),
    },
    middleName: {
      type: Sequelize.DataTypes.STRING(30),
    },
    lastName: {
      type: Sequelize.DataTypes.STRING(30),
    },
    email: {
      type: Sequelize.DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    address: {
      type: Sequelize.DataTypes.STRING(300),
    },
    phone: {
      type: Sequelize.DataTypes.STRING(20),
      unique: true,
      validate: {
        is: /^\+(?:[0-9] ?){6,14}[0-9]$/
      },
    },
    role:{
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE
    },
    updatedAt: {
      type: Sequelize.DataTypes.DATE
    }
});

const Charge = sequelize.define('charges',
    {
        name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        ICCS: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        UNODC: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        counts: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        particulars: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: ''
        },
        dateOfOffence: {
          type: Sequelize.DataTypes.DATEONLY,
          allowNull: true,
          defaultValue: Sequelize.NOW
        }


    }
);

Submission.belongsTo(User);

User.hasMany(Submission);

Submission.hasOne(Complainant);

Complainant.belongsTo(Submission);

Submission.hasMany(Accused);

Accused.belongsTo(Submission);

Accused.hasMany(Charge);

Charge.belongsTo(Accused);

Accused.hasMany(Pending);

Pending.belongsTo(Accused);

Accused.hasMany(Conviction);

Conviction.belongsTo(Accused);

sequelize.sync({alter: true})
.then((data) => {
    console.log('Table and model synced sucessfully');
}).catch((error) => {
    console.log('Error syncing table and model', error);
})