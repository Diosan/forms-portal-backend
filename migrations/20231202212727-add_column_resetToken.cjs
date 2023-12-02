'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // async up (queryInterface, Sequelize) {
  //   await queryInterface.addColumn('users', 'resetToken', {
  //       type: DataTypes.UUID,
  //       defaultValue: DataTypes.UUIDV4,
  //     })
  // },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'resetTOken');
  },

 
};
