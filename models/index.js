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
import createErrorTypeModel from "./errortypes.model.js";
import createAccusedModel from "./accuseds.model.js";
import createChargesModel from "./charges.model.js";
import createPermissionsModel from "./permissions.model.js";
import createPendingModel from "./pendings.model.js";
import createPasswordResetModel from "./password_reset.model.js";
import createConvictionModel from "./convictions.model.js";
import createSigntureModel from "./signatures.model.js";


export const UserModel = createUserModel(sequelize);
export const AdminUserModel = createAdminUserModel(sequelize);
export const SubmissionModel = createSubmissionModel(sequelize);
export const ComplainantModel = createComplainantModel(sequelize);
export const AccessLogModel = createAccessLogModel(sequelize);
export const ErrorLogModel = createErrorLogModel(sequelize);
export const ErrorTypeModel = createErrorTypeModel(sequelize);
export const AccusedModel = createAccusedModel(sequelize);
export const ChargesModel = createChargesModel(sequelize);
export const PermissionModel = createPermissionsModel(sequelize);
export const PasswordResetModel = createPasswordResetModel(sequelize);
export const PendingModel = createPendingModel(sequelize);
export const ConvictionModel = createConvictionModel(sequelize);
export const SignatureModel = createSigntureModel(sequelize);

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
PendingModel.belongsTo(PendingModel, { foreignKey: 'accusedId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
AccusedModel.hasMany(PendingModel)
// Pendings ++++++++++
ConvictionModel.belongsTo(ConvictionModel, { foreignKey: 'accusedId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
AccusedModel.hasMany(ConvictionModel)
// Pendings ++++++++++
SignatureModel.belongsTo(UserModel, { foreignKey: 'userId', onDelete: 'RESTRICT', onUpdate: 'CASCADE'  });
UserModel.hasMany(SignatureModel)
// Signatures ++++++++++

// Passwords ++++++++++
// UserModel.hasMany(PasswordResetModel, { foreignKey: 'userId' });
// PasswordResetModel.belongsTo(UserModel, { foreignKey: 'userId' });
