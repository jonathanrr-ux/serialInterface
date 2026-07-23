'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class AutoSend extends Model {
        static associate(models) {
            AutoSend.belongsTo(models.Template, {
                foreignKey: 'template_id',
                as: 'template',
                onDelete: 'CASCADE'
            });

            AutoSend.belongsTo(models.Packet, {
                foreignKey: 'packet_id',
                as: 'packet'
            });
        }
    }

    AutoSend.init({
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

        packet_id: {
            type: DataTypes.UUID,
            allowNull: true
        },

        name: {
            type: DataTypes.STRING(40),
            allowNull: false
        },

        type: {
            type: DataTypes.ENUM('packet', 'template'),
            allowNull: false
        },

        interval: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        start_on_connect: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }

    }, {
        sequelize,
        modelName: 'AutoSend',
        tableName: 'auto_send',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return AutoSend;
};