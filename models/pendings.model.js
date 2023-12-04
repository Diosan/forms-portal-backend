// password_reset.model.js
import { DataTypes } from 'sequelize';

const createPendingModel = (sequelize) => {
  const Pending = sequelize.define('pendings', {
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
            allowNull: true
        }
    });

    // Accused.associate = function (models) {
    //     Accused.belongsTo(models.submission);
    // };
                                         
    return Pending;
};
export default createPendingModel;
