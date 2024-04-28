import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * removeColumn "estimatedDuration" from table "funcion"
 * addColumn "duration" to table "funcion"
 * addColumn "fecha_lanzamiento" to table "movie"
 * addColumn "createdBy" to table "sala"
 * changeColumn "startTime" on table "funcion"
 *
 **/

const info = {
  revision: "20240423163018",
  name: "migration",
  created: "2024-04-23T20:30:18.591Z",
  comment: "",
};

const migrationCommands = [
  { fn: "removeColumn", params: ["funcion", "estimatedDuration"] },
  {
    fn: "addColumn",
    params: [
      "funcion",
      "duration",
      {
        type: Sequelize.INTEGER,
        field: "duration",
        defaultValue: 0,
        allowNull: true,
      },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "movie",
      "fecha_lanzamiento",
      { type: Sequelize.DATE, field: "fecha_lanzamiento", allowNull: true },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "sala",
      "createdBy",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "NO ACTION",
        references: { model: "user", key: "id" },
        allowNull: true,
        name: "createdBy",
        field: "createdBy",
      },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "funcion",
      "startTime",
      { type: Sequelize.TIME, field: "startTime", allowNull: false },
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
