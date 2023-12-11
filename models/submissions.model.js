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
      matterType: {           
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Indictable'
      },
      summaryOfEvidence: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'started'
      },
      type: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'complaint_with_oath'
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      efilingId: { 
        type: DataTypes.STRING,
        allowNull: true,
      },
      efilingResponse: {
        type: DataTypes.JSON,
        allowNull: true
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