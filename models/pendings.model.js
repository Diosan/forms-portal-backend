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
            type: Sequelize.STRING,
            allowNull: false
        },
        dateOfOffence:{
            type: Sequelize.DataTypes.DATEONLY, 
            allowNull: true
        }
    });

    // Accused.associate = function (models) {
    //     Accused.belongsTo(models.submission);
    // };
                                         
    return Pending;
};
export default createPendingModel;
