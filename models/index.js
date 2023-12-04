import { dbConfig } from "../config/db.config.js";

import {Sequelize, } from "sequelize";
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

export const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
import createUserModel from "./users.model.js";
import createAdminUserModel from "./admin_users.model.js";
import createSubmissionModel from "./submissions.model.js";
import createComplainantModel from "./complainants.model.js";
import createAccessLogModel from "./accesslogs.model.js";
import createErrorLogModel from "./errorlogs.model.js";
import createErrorTypeModel from "./errorlogs.model.js";
import createAccusedModel from "./accuseds.model.js";
import createChargesModel from "./charges.model.js";
import createPermissionsModel from "./permissions.model.js";
import createPasswordResetModel from "./password_reset.model.js";


export const UserModel = createUserModel(sequelize);
export const AdminUserModel = createAdminUserModel(sequelize);
export const SubmissionModel = createSubmissionModel(sequelize);
export const ComplainantModel = createComplainantModel(sequelize);
export const AccessLogModel = createAccessLogModel(sequelize);
export const ErrorLogModel = createErrorLogModel(sequelize);
export const ErrorTypeModel = createErrorTypeModel(sequelize);
export const AccusedModel = createAccusedModel(sequelize);
export const ChargesModel = createChargesModel(sequelize);
export const PermissionModel = createChargesModel(sequelize);
export const PasswordResetModel = createPasswordResetModel(sequelize);


<<<<<<< HEAD
=======
db.users = require("./users.model.js")(sequelize, Sequelize);
db.submissions = require("./submissions.model.js")(sequelize, Sequelize);
db.complainants = require("./complainants.model.js")(sequelize, Sequelize);
db.accuseds = require("./accuseds.model.js")(sequelize, Sequelize);
db.charges = require("./charges.model.js")(sequelize, Sequelize);
db.pendings = require("./pendings.model.js")(sequelize, Sequelize);
db.convictions = require("./convictions.model.js")(sequelize, Sequelize);
>>>>>>> origin/Dion2

// ---------------------
// ASSOCIATIONS
// Users ++++++++++
SubmissionModel.belongsTo(UserModel, { foreignKey: 'userId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
UserModel.hasMany(SubmissionModel);
// Submissions ++++++++++
ComplainantModel.belongsTo(SubmissionModel, { foreignKey: 'submissionId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
SubmissionModel.hasOne(ComplainantModel)
// Complainants ++++++++++
AccusedModel.belongsTo(SubmissionModel, { foreignKey: 'submissionId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
SubmissionModel.hasMany(UserModel)
// Accuseds ++++++++++
ChargesModel.belongsTo(AccusedModel, { foreignKey: 'accusedId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
AccusedModel.hasMany(ChargesModel)
// Charges ++++++++++
db.pendings.belongsTo(db.pendings, { foreignKey: 'accusedId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
db.accuseds.hasMany(db.pendings)
// Pendings ++++++++++
db.convictions.belongsTo(db.convictions, { foreignKey: 'accusedId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
db.accuseds.hasMany(db.convictions)
// Pendings ++++++++++

// Passwords ++++++++++
// UserModel.hasMany(PasswordResetModel, { foreignKey: 'userId' });
// PasswordResetModel.belongsTo(UserModel, { foreignKey: 'userId' });
