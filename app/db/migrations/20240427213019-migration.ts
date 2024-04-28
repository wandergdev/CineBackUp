import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * createTable "preciotaquillas", deps: [user]
 * addColumn "tipoTaquilla" to table "comprartaquilla"
 * changeColumn "cantidadTaquillas" on table "comprartaquilla"
 * changeColumn "fechaHoraCompra" on table "comprartaquilla"
 * changeColumn "fechaHoraCompra" on table "comprartaquilla"
 *
 **/

const info = {
  revision: "20240427213019",
  name: "migration",
  created: "2024-04-28T01:30:19.867Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "createTable",
    params: [
      "preciotaquillas",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        precio: { type: Sequelize.INTEGER, field: "precio", allowNull: false },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "user", key: "id" },
          allowNull: true,
          name: "userId",
          field: "userId",
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "addColumn",
    params: [
      "comprartaquilla",
      "tipoTaquilla",
      { type: Sequelize.STRING, field: "tipoTaquilla", allowNull: false },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "comprartaquilla",
      "cantidadTaquillas",
      {
        type: Sequelize.INTEGER,
        field: "cantidadTaquillas",
        defaultValue: 1,
        allowNull: false,
      },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "comprartaquilla",
      "fechaHoraCompra",
      {
        type: Sequelize.DATE,
        field: "fechaHoraCompra",
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "comprartaquilla",
      "fechaHoraCompra",
      {
        type: Sequelize.DATE,
        field: "fechaHoraCompra",
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
    ],
  },
];

export default {
  up: async (queryInterface: Sequelize.QueryInterface) => {
    for (const command of migrationCommands) {
      console.log("Execute: " + command.fn);
      await queryInterface[command.fn](...command.params);
    }
  },
  info: info,
};
