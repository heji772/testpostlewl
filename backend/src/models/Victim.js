const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Victim = sequelize.define('Victim', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    encryptedPayload: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    submissionContext: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: 'victims',
    underscored: true,
  });

  return Victim;
};
