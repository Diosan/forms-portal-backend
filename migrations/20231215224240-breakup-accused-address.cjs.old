'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'addressLine1', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
      }
    );

    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'addressLine2', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
      }
    );

    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'addressLine3', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
      }
    );

    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'cityTown', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
      }
    );

    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'postalCode', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
      }
    );

    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'communityCode', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
      }
    );

    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'countryCode', // Name of the new column
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
