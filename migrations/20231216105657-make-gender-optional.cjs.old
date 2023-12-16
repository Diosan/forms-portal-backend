'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.changeColumn(
      'accuseds', // Name of the table
      'gender', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
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
