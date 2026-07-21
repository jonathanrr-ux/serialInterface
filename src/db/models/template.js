'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Template extends Model {
        static associate(models) {
            Template.belongsTo(models.Group, {
                foreignKey: 'group_id',
                as: 'group'
            });
            Template.hasMany(models.Packet, {
                foreignKey: 'template_id',
                as: 'packets',
                onDelete: 'CASCADE'
            });
            Template.hasMany(models.Rule, {
                foreignKey: 'template_id',
                as: 'rules',
                onDelete: 'CASCADE'
            });
        }
    }
    Template.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        group_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        description: DataTypes.STRING(100)
    }, {
        sequelize,
        modelName: 'Template',
        tableName: 'template',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Template;
};