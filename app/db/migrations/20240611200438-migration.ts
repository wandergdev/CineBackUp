import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * addColumn "proximamente" to table "movie"
 *
 **/

const info = {
  revision: "20240611200438",
  name: "migration",
  created: "2024-06-12T00:04:38.482Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "movie",
      "proximamente",
      {
        type: Sequelize.BOOLEAN,
        field: "proximamente",
        defaultValue: false,
        allowNull: false,
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
