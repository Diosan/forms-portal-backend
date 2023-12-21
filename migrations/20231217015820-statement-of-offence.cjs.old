'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'charges', // Name of the table
      'statementOfOffence', // Name of the new column
      {
        type: Sequelize.TEXT, // Data type of the column
        allowNull: true // Column can be null
      }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
