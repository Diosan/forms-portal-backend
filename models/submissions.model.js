<<<<<<< HEAD
import  {DataTypes} from "sequelize";
export default sequelize => {
  const Submission = sequelize.define("submissions", {
    //   id: {
    //     type: DataTypes.UUID,
    //     defaultValue: DataTypes.UUIDV4 ,
    //     primaryKey: true
    //   },
=======
const {DataTypes} = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const Submission = sequelize.define("submissions", {
      // id: {
      //   type: DataTypes.UUID,
      //   defaultValue: DataTypes.UUIDV4 ,
      //   primaryKey: true
      // },
>>>>>>> origin/Dion2
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
<<<<<<< HEAD
        autoIncrement: true,
=======
        autoIncrement: true
>>>>>>> origin/Dion2
      },
      //   id: {
      //     type: DataTypes.UUID,
      //     primaryKey: true,
      //     unique: true
      //   },
      description: {           
        type: DataTypes.STRING,
        allowNull: false
      },
      summaryOfEvidence: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      status: { 
<<<<<<< HEAD
        type: DataTypes.STRING,
        allowNull: false
=======
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'started'
      },
      type: { 
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'complaint_with_oath'
>>>>>>> origin/Dion2
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      }
    });

    // Submission.associate = function (models) {
    //     Submission.belongsTo(models.user);
    //     Submission.hasOne(models.complainant, {
    //       onDelete: "CASCADE",
    //     });
    //     Submission.hasMany(models.accused, {
    //       onDelete: "CASCADE",
    //     });
    // };

    return Submission;
};