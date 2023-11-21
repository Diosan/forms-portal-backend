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
  },
  hooks: {
    beforeCreate: ((attributes) => {
      if (attributes
        && attributes.dataValues
        && attributes.dataValues.hasOwnProperty('id')
      ) {
        delete attributes.dataValues.id
      }
    })
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.model.js")(sequelize, Sequelize);
db.submission = require("./submissions.model.js")(sequelize, Sequelize);
db.complainant = require("./complainants.model.js")(sequelize, Sequelize);

module.exports = db; 