'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('complainants', 'complainants_ibfk_1'); // Remove the existing constraint
    await queryInterface.addConstraint('complainants', {
      fields: ['submissionId'],
      type: 'foreign key',
      name: 'complainants_ibfk_1',
      references: {
        table: 'submissions',
        field: 'id',
      },
      onDelete: 'SET NULL', // Change this line to SET NULL
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('complainants', 'complainants_ibfk_1'); // Remove the modified constraint
    await queryInterface.addConstraint('complainants', {
      fields: ['submissionId'],
      type: 'foreign key',
      name: 'complainants_ibfk_1',
      references: {
        table: 'submissions',
        field: 'id',
      },
      onDelete: 'RESTRICT', // Revert to RESTRICT if necessary
      onUpdate: 'CASCADE',
    });
  },
};
