const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const Submission = sequelize.define("submissions", {
    //   id: {
    //     type: DataTypes.UUID,
    //     defaultValue: DataTypes.UUIDV4,
    //     primaryKey: true,
    //     unique: true
    //   },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true
      },
      description: {           //your unique id from your agency. eg. Regimental number
        type: Sequelize.STRING,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    });

    return Submission;
};