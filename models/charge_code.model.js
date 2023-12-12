
import  {DataTypes} from "sequelize";
export default sequelize => {
    const ChargeCode = sequelize.define("charge_codes", {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        ICCS: {
            type: DataTypes.STRING,
            allowNull: false
        },
        UNODC: {
            type: DataTypes.STRING,
            allowNull: false
        }

    });

    return ChargeCode;

};