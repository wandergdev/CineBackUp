import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * removeColumn "director" from table "movie"
 * createTable "sala", deps: []
 * createTable "funcion", deps: [movie, sala]
 * createTable "comprartaquilla", deps: [user, funcion]
 * addColumn "poster_path" to table "movie"
 * addColumn "description" to table "movie"
 * addColumn "genero" to table "movie"
 * addColumn "rating" to table "movie"
 * addColumn "external_id" to table "movie"
 *
 **/

const info = {
  revision: "20240418214804",
  name: "migration",
  created: "2024-04-19T01:48:04.172Z",
  comment: "",
};

const migrationCommands = [
  { fn: "removeColumn", params: ["movie", "director"] },
  {
    fn: "createTable",
    params: [
      "sala",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        capacity: {
          type: Sequelize.INTEGER,
          field: "capacity",
          allowNull: false,
        },
        type: { type: Sequelize.STRING, field: "type", allowNull: false },
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
    fn: "createTable",
    params: [
      "funcion",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
        },
        movieId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "movie", key: "id" },
          name: "movieId",
          field: "movieId",
          allowNull: false,
        },
        salaId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "sala", key: "id" },
          name: "salaId",
          field: "salaId",
          allowNull: false,
        },
        startTime: {
          type: Sequelize.DATE,
          field: "startTime",
          allowNull: false,
        },
        estimatedDuration: {
          type: Sequelize.INTEGER,
          field: "estimatedDuration",
          allowNull: false,
        },
        status: { type: Sequelize.STRING, field: "status", allowNull: false },
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
    fn: "createTable",
    params: [
      "comprartaquilla",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "user", key: "id" },
          name: "userId",
          field: "userId",
          allowNull: false,
        },
        funcionId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "funcion", key: "id" },
          name: "funcionId",
          field: "funcionId",
          allowNull: false,
        },
        cantidadTaquillas: {
          type: Sequelize.INTEGER,
          field: "cantidadTaquillas",
          allowNull: false,
        },
        costoTotal: {
          type: Sequelize.FLOAT,
          field: "costoTotal",
          allowNull: false,
        },
        fechaHoraCompra: {
          type: Sequelize.DATE,
          field: "fechaHoraCompra",
          allowNull: false,
        },
        estadoTransaccion: {
          type: Sequelize.STRING,
          field: "estadoTransaccion",
          allowNull: false,
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
      "movie",
      "poster_path",
      { type: Sequelize.STRING, field: "poster_path", allowNull: true },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "movie",
      "description",
      { type: Sequelize.TEXT, field: "description", allowNull: false },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "movie",
      "genero",
      {
        type: Sequelize.ARRAY(Sequelize.STRING),
        field: "genero",
        allowNull: false,
      },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "movie",
      "rating",
      { type: Sequelize.INTEGER, field: "rating", allowNull: false },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "movie",
      "external_id",
      { type: Sequelize.INTEGER, field: "external_id", allowNull: false },
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
