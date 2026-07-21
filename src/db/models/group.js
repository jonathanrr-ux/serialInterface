'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Group extends Model {
        static associate(models) {
            Group.hasMany(models.Template, {
                foreignKey: 'group_id',
                as: 'templates'
            });
        }
    }
    Group.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(100),
            allowNull: true
        }, 
        icon: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'folder'
        },
        color: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: '#6366F1'
        },
        removed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Group',
        tableName: 'group',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Group;
};