'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'phone', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true
      }
    );
    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'bailStatus', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true
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
