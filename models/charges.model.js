
import  {DataTypes} from "sequelize";
export default sequelize => {
    const Charge = sequelize.define("charges", {
        //   id: {
        //     type: DataTypes.UUID,
        //     defaultValue: DataTypes.UUIDV4,
        //     primaryKey: true,
        //     unique: true
        //   },
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                unique: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ICCS: {
                type: DataTypes.STRING,
                allowNull: false
            },
            UNODC: {
                type: DataTypes.STRING,
                allowNull: false
            },
            counts: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            particulars: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            dateOfOffence: {
              type: DataTypes.TEXT,
              allowNull: true
            },
            accusedId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
        });
    
        // Charge.associate = function (models) {
        //     Complainant.belongsTo(models.submission);
        // };

    return Charge;
};