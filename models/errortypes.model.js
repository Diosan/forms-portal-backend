module.exports = (sequelize, Sequelize) => {
  const ErrorType = sequelize.define("errortypes", {
    id:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    err_message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    error_desc: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE
    },
  });

  return ErrorType;
};