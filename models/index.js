const dbConfig = require("../config/db.config.js");

const {Sequelize, } = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.model.js")(sequelize, Sequelize);
db.submissions = require("./submissions.model.js")(sequelize, Sequelize);
db.complainants = require("./complainants.model.js")(sequelize, Sequelize);
db.accuseds = require("./accuseds.model.js")(sequelize, Sequelize);
db.charges = require("./charges.model.js")(sequelize, Sequelize);

// ---------------------
// ASSOCIATIONS
// Users ++++++++++
db.submissions.belongsTo(db.users, { foreignKey: 'userId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
db.users.hasMany(db.submissions);
// Submissions ++++++++++
db.complainants.belongsTo(db.submissions, { foreignKey: 'submissionId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
db.submissions.hasOne(db.complainants)
// Complainants ++++++++++
db.accuseds.belongsTo(db.submissions, { foreignKey: 'submissionId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
db.submissions.hasMany(db.accuseds)
// Accuseds ++++++++++
db.charges.belongsTo(db.accuseds, { foreignKey: 'accusedId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
db.accuseds.hasMany(db.charges)
// Charges ++++++++++

module.exports = db; 