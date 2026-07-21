'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Rule extends Model {
        static associate(models) {
            Rule.belongsTo(models.Template, {
                foreignKey: 'template_id',
                as: 'template',
                onDelete: 'CASCADE'
            });
        }
    }
    Rule.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        template_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        condition: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        },
        action: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Rule',
        tableName: 'rule',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Rule;
};