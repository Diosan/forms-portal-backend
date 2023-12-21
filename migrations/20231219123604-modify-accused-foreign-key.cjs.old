'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Modify the foreign key constraint on 'charges' table
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint('charges', 'charges_ibfk_1', { transaction });
      await queryInterface.addConstraint('charges', {
        fields: ['accusedId'],
        type: 'foreign key',
        name: 'charges_ibfk_1',
        references: {
          table: 'accuseds',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the foreign key constraint on 'charges' table to 'RESTRICT'
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint('charges', 'charges_ibfk_1', { transaction });
      await queryInterface.addConstraint('charges', {
        fields: ['accusedId'],
        type: 'foreign key',
        name: 'charges_ibfk_1',
        references: {
          table: 'accuseds',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        transaction,
      });
    });
  }
};
