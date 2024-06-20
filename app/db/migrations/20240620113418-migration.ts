import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * addColumn "validUntil" to table "comprartaquilla"
 * addColumn "scanned" to table "comprartaquilla"
 *
 **/

const info = {
  revision: "20240620113418",
  name: "migration",
  created: "2024-06-20T15:34:18.895Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "comprartaquilla",
      "validUntil",
      { type: Sequelize.DATE, field: "validUntil", allowNull: false },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "comprartaquilla",
      "scanned",
      {
        type: Sequelize.BOOLEAN,
        field: "scanned",
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
