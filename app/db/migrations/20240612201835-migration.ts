import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * addColumn "isPremiere" to table "funcion"
 *
 **/

const info = {
  revision: "20240612201835",
  name: "migration",
  created: "2024-06-13T00:18:35.735Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "funcion",
      "isPremiere",
      {
        type: Sequelize.BOOLEAN,
        field: "isPremiere",
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
