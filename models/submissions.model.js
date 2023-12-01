const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const Submission = sequelize.define("submissions", {
    //   id: {
    //     type: DataTypes.UUID,
    //     defaultValue: DataTypes.UUIDV4 ,
    //     primaryKey: true
    //   },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true
      },
    //   id: {
    //     type: DataTypes.UUID,
    //     primaryKey: true,
    //     unique: true
    //   },
      description: {           
        type: Sequelize.STRING,
        allowNull: false
      },
      summaryOfEvidence: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      status: { 
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'started'
      },
      type: { 
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'complaint_with_oath'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    });

    Submission.associate = function (models) {
        Submission.belongsTo(models.user);
        Submission.hasOne(models.complainant, {
          onDelete: "CASCADE",
        });
        Submission.hasMany(models.accused, {
          onDelete: "CASCADE",
        });
    };

    return Submission;
};