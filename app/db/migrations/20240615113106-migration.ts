import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * addColumn "trailer_key" to table "movie"
 *
 **/

const info = {
  revision: "20240615113106",
  name: "migration",
  created: "2024-06-15T15:31:06.828Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "movie",
      "trailer_key",
      { type: Sequelize.STRING, field: "trailer_key", allowNull: true },
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
