import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * addColumn "isWeekend" to table "funcion"
 *
 **/

const info = {
  revision: "20240615102333",
  name: "migration",
  created: "2024-06-15T14:23:33.210Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "funcion",
      "isWeekend",
      {
        type: Sequelize.BOOLEAN,
        field: "isWeekend",
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
