import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * changeColumn "endTime" on table "funcion"
 * changeColumn "startTime" on table "funcion"
 *
 **/

const info = {
  revision: "20240607110512",
  name: "migration",
  created: "2024-06-07T15:05:12.151Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "changeColumn",
    params: [
      "funcion",
      "endTime",
      { type: Sequelize.INTEGER, field: "endTime", allowNull: false },
    ],
  },
  {
    fn: "changeColumn",
    params: [
      "funcion",
      "startTime",
      { type: Sequelize.INTEGER, field: "startTime", allowNull: false },
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
