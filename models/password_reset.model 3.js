// password_reset.model.js
import { DataTypes } from 'sequelize';

const createPasswordResetModel = (sequelize) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiration: {
      type: DataTypes.DATE,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  });

  return PasswordReset;
};

export default createPasswordResetModel;
