'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Complainants', 'submissionId', {
      type: Sequelize.INTEGER, // Adjust the data type if needed
      references: {
        model: 'Submissions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Change this line to SET NULL
      allowNull: true, // Allow null values for the foreign key
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Complainants', 'submissionId', {
      type: Sequelize.INTEGER, // Adjust the data type if needed
      references: {
        model: 'Submissions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // Revert to RESTRICT if necessary
      allowNull: false, // Change to false if necessary
    });
  },
};
