
import  {DataTypes} from "sequelize";
export default sequelize => {
    const ChargeCode = sequelize.define("charge_codes", {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        nid:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        section:{
            type: DataTypes.STRING(500),
            allowNull: true
        },
        ICCS: {
            type: DataTypes.STRING,
            allowNull: true
        },
        category:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        UNODC: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return ChargeCode;

};