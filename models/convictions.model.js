
import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Conviction = sequelize.define("convictions", {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        offence: {           
            type: DataTypes.STRING,
            allowNull: false
        },
        dateOfOffence:{
          type: DataTypes.DATEONLY, 
          allowNull: false
        },
        sentence: {           
            type: DataTypes.STRING,
            allowNull: false
        }
    });

                                         
    return Conviction;
};

