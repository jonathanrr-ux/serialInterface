'use strict';

import { Sequelize } from "sequelize";
import config from '../config/config.js';

import Group from "./group.js";
import Template from "./template.js";
import Packet from "./packet.js";
import Rule from "./rule.js";
import AutoSend from "./auto-send.js";


const sequelize = new Sequelize(config[process.env.NODE_ENV]);

const db = {
    sequelize,
    Sequelize,

    Group: Group(sequelize, Sequelize.DataTypes),
    Template: Template(sequelize, Sequelize.DataTypes),
    Packet: Packet(sequelize, Sequelize.DataTypes),
    Rule: Rule(sequelize, Sequelize.DataTypes),
    AutoSend: AutoSend(sequelize, Sequelize.DataTypes)
};


// Relacionamentos
Object.values(db).forEach(model => {
    if (model.associate) {
        model.associate(db);
    }
});

export default db;
