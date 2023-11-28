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
        autoIncrement: true
      },
    //   id: {
    //     type: DataTypes.UUID,
    //     primaryKey: true,
    //     unique: true
    //   },
      description: {           //your unique id from your agency. eg. Regimental number
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {           //your unique id from your agency. eg. Regimental number
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'started'
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      }
    });


    return Submission;
};