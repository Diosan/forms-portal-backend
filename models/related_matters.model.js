// password_reset.model.js
import { DataTypes } from 'sequelize';

const createRelatedMatterModel = (sequelize) => {
  const RelatedMatter = sequelize.define('relatedMatters', {
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
                                         
    return RelatedMatter;
};
export default createRelatedMatterModel;
