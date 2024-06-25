import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * changeColumn "movieId" on table "funcion"
 *
 **/

const info = {
  revision: "20240625144544",
  name: "migration",
  created: "2024-06-25T18:45:44.858Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "changeColumn",
    params: [
      "funcion",
      "movieId",
      {
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        references: { model: "movie", key: "id" },
        name: "movieId",
        field: "movieId",
        onDelete: "CASCADE",
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
