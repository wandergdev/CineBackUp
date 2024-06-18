import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * addColumn "qrCode" to table "comprartaquilla"
 *
 **/

const info = {
  revision: "20240617004049",
  name: "migration",
  created: "2024-06-17T04:40:49.335Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "comprartaquilla",
      "qrCode",
      { type: Sequelize.TEXT, field: "qrCode", allowNull: true },
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
