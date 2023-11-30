import  {DataTypes} from "sequelize";
export default sequelize => {
  const Submission = sequelize.define("submissions", {
    //   id: {
    //     type: DataTypes.UUID,
    //     defaultValue: DataTypes.UUIDV4 ,
    //     primaryKey: true
    //   },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
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
      status: { 
        type: DataTypes.STRING,
        allowNull: false
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