'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('accuseds', 'submissionId', {
      type: Sequelize.UUID,
      allowNull: true, // Allow the column to be null
      onDelete: 'SET NULL', // Set the onDelete constraint to SET NULL
      onUpdate: 'CASCADE',
      references: {
        model: 'submissions',
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('accuseds', 'submissionId', {
      type: Sequelize.UUID,
      allowNull: false, // You can revert allowNull to true/false based on your schema
      onDelete: 'RESTRICT', // You can revert onDelete to 'CASCADE' or 'SET NULL'
      onUpdate: 'CASCADE',
      references: {
        model: 'submissions',
        key: 'id',
      },
    });
  },
};
