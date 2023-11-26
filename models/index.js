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

export const UserModel = createUserModel(sequelize);
export const AdminUserModel = createAdminUserModel(sequelize);
export const SubmissionModel = createSubmissionModel(sequelize);
export const ComplainantModel = createComplainantModel(sequelize);
export const AccessLogModel = createAccessLogModel(sequelize);
export const ErrorLogModel = createErrorLogModel(sequelize);
export const ErrorTypeModel = createErrorTypeModel(sequelize);

// ---------------------
// ASSOCIATIONS
// Users ++++++++++
SubmissionModel.belongsTo(UserModel, { foreignKey: 'userId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
UserModel.hasMany(SubmissionModel);
// Submissions ++++++++++
ComplainantModel.belongsTo(SubmissionModel, { foreignKey: 'submissionId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
SubmissionModel.hasOne(ComplainantModel)
