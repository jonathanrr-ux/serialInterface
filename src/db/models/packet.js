'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Packet extends Model {
        static associate(models) {
            Packet.belongsTo(models.Template, {
                foreignKey: 'template_id',
                as: 'template',
                onDelete: 'CASCADE'
            });
        }
    }
    Packet.init({
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
        bytes: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        }
    }, {
        sequelize,
        modelName: 'Packet',
        tableName: 'packet',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Packet;
};