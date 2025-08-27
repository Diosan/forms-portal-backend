import  {DataTypes} from "sequelize";
export default sequelize => {

    const Signature = sequelize.define("signatures", {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        record: {
            type: DataTypes.TEXT,
            allowNull: false
        },        
        hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        content_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true
        }


    });

    return Signature;

}