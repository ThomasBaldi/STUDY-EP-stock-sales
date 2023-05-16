module.exports = (sequelize, Sequelize) => {
	const Role = sequelize.define(
		'Role',
		{
			Role: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
		},
		{
			timestamps: false,
		}
	);

	//create relationships
	Role.associate = function (models) {
		Role.hasMany(models.User, {
			foreignKey: {
				name: 'Role',
				type: Sequelize.DataTypes.INTEGER,
				defaultValue: 1,
			},
		});
	};
	return Role;
};
