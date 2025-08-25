'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn(
      'complainants', // Name of the table
      'middleName', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
      }
    );

    await queryInterface.addColumn(
      'accuseds', // Name of the table
      'middleName', // Name of the new column
      {
        type: Sequelize.STRING, // Data type of the column
        allowNull: true, // Column can be null
      }
    );

  },

  async down (queryInterface, Sequelize) {

  }
};
