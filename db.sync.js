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

Submission.belongsTo(User);

User.hasMany(Submission);

Submission.hasOne(Complainant);

Complainant.belongsTo(Submission);

Submission.hasMany(Accused);

Accused.belongsTo(Submission);

sequelize.sync({alter: true})
.then((data) => {
    console.log('Table and model synced sucessfully');
}).catch((error) => {
    console.log('Error syncing table and model', error);
})