'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'phone', {
      type: DataTypes.STRING(20),
      unique: true,
      validate: {
        is: /^(868[0-9]{7}|[0-9]{7})$/
      }
    });
  },

  // async down(queryInterface, Sequelize) {
  //   // Logic for reverting the changes
  // }
};
