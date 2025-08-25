// password_reset.model.js
import { DataTypes } from 'sequelize';

const createVerifierModel = (sequelize) => {
    const Verifier = sequelize.define('verifiers', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        email: {           
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false            
        }
    });

    return Verifier;
};
export default createVerifierModel;
