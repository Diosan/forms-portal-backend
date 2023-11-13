module.exports = (sequelize, Sequelize) => {
    const Permission = sequelize.define("permissions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      permissions: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      selectable:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // createdAt: {
      //   type: Sequelize.DATE
      // },
      // updatedAt: {
      //   type: Sequelize.DATE
      // }
      
    });
  
    return Permission;
  };