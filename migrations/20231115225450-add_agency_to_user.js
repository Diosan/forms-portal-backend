'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    queryInterface.addColumn(
      'users',
      'agencyName',
      Sequelize.STRING
    )

  },

  async down (queryInterface, Sequelize) {

    queryInterface.removeColumn('users', 'agencyName')

  }
};
