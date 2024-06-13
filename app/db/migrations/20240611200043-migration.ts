import Sequelize from "sequelize";

/**
 * Actions summary:
 *
 * createTable "file", deps: []
 * createTable "jwtblacklist", deps: []
 * createTable "movie", deps: []
 * createTable "policy", deps: []
 * createTable "region", deps: []
 * createTable "role", deps: []
 * createTable "user", deps: []
 * createTable "sala", deps: [user]
 * createTable "funcion", deps: [movie, sala]
 * createTable "preciotaquillas", deps: [user]
 * createTable "profile", deps: [user]
 * createTable "role_policy", deps: [role, policy]
 * createTable "comprartaquilla", deps: [user, funcion]
 * createTable "user_role", deps: [user, role]
 *
 **/

const info = {
  revision: "20240611200043",
  name: "migration",
  created: "2024-06-12T00:00:43.067Z",
  comment: "",
};

const migrationCommands = [
  {
    fn: "createTable",
    params: [
      "file",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        type: { type: Sequelize.STRING, field: "type", allowNull: false },
        fileName: {
          type: Sequelize.STRING,
          field: "fileName",
          allowNull: false,
        },
        path: { type: Sequelize.STRING, field: "path", allowNull: false },
        isUploaded: {
          type: Sequelize.BOOLEAN,
          field: "isUploaded",
          defaultValue: false,
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
    fn: "createTable",
    params: [
      "jwtblacklist",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        token: {
          type: Sequelize.STRING(512),
          field: "token",
          allowNull: false,
        },
        expires: {
          type: Sequelize.DATE,
          field: "expires",
          defaultValue: null,
          allowNull: true,
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
    fn: "createTable",
    params: [
      "movie",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          defaultValue: null,
          allowNull: true,
        },
        duration: {
          type: Sequelize.INTEGER,
          field: "duration",
          defaultValue: 0,
          allowNull: true,
        },
        fecha_lanzamiento: {
          type: Sequelize.DATE,
          field: "fecha_lanzamiento",
          allowNull: true,
        },
        poster_path: {
          type: Sequelize.STRING,
          field: "poster_path",
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          field: "description",
          allowNull: false,
        },
        genero: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          field: "genero",
          allowNull: false,
        },
        rating: { type: Sequelize.INTEGER, field: "rating", allowNull: false },
        external_id: {
          type: Sequelize.INTEGER,
          field: "external_id",
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
    fn: "createTable",
    params: [
      "policy",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        description: {
          type: Sequelize.STRING,
          field: "description",
          allowNull: false,
        },
        permission: {
          type: Sequelize.JSON,
          field: "permission",
          allowNull: false,
        },
        isSystemManaged: {
          type: Sequelize.BOOLEAN,
          field: "isSystemManaged",
          defaultValue: false,
          allowNull: true,
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
    fn: "createTable",
    params: [
      "region",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        regionCodeAlphaThree: {
          type: Sequelize.STRING,
          field: "regionCodeAlphaThree",
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
    fn: "createTable",
    params: [
      "role",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        label: {
          type: Sequelize.STRING,
          field: "label",
          defaultValue: "",
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
          field: "description",
          allowNull: false,
        },
        isDefault: {
          type: Sequelize.BOOLEAN,
          field: "isDefault",
          defaultValue: false,
          allowNull: true,
        },
        isPrivate: {
          type: Sequelize.BOOLEAN,
          field: "isPrivate",
          defaultValue: false,
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
    fn: "createTable",
    params: [
      "user",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          defaultValue: null,
          allowNull: true,
        },
        firstName: {
          type: Sequelize.STRING,
          field: "firstName",
          defaultValue: null,
          allowNull: true,
        },
        lastName: {
          type: Sequelize.STRING,
          field: "lastName",
          defaultValue: null,
          allowNull: true,
        },
        uid_azure: {
          type: Sequelize.STRING,
          field: "uid_azure",
          defaultValue: null,
          allowNull: true,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          field: "isActive",
          defaultValue: false,
          allowNull: false,
        },
        isEmailConfirmed: {
          type: Sequelize.BOOLEAN,
          field: "isEmailConfirmed",
          defaultValue: false,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          field: "email",
          validate: { isEmail: true },
          unique: true,
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING,
          field: "password",
          validate: { isLength: { min: 8 } },
          allowNull: false,
        },
        authType: {
          type: Sequelize.ENUM("email", "microsoft", "google"),
          field: "authType",
          defaultValue: "email",
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
        createdBy: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "user", key: "id" },
          allowNull: true,
          name: "createdBy",
          field: "createdBy",
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
        duration: {
          type: Sequelize.INTEGER,
          field: "duration",
          defaultValue: 0,
          allowNull: true,
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
          type: Sequelize.INTEGER,
          field: "startTime",
          allowNull: false,
        },
        endTime: {
          type: Sequelize.INTEGER,
          field: "endTime",
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
      "preciotaquillas",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        precio: { type: Sequelize.INTEGER, field: "precio", allowNull: false },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "user", key: "id" },
          allowNull: true,
          name: "userId",
          field: "userId",
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
    fn: "createTable",
    params: [
      "profile",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        time_zone: {
          type: Sequelize.STRING,
          field: "time_zone",
          defaultValue: null,
          allowNull: true,
        },
        locale: {
          type: Sequelize.ENUM("en", "es"),
          field: "locale",
          allowNull: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "user", key: "id" },
          allowNull: true,
          name: "userId",
          field: "userId",
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
    fn: "createTable",
    params: [
      "role_policy",
      {
        roleId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "role", key: "id" },
          name: "roleId",
          field: "roleId",
          allowNull: false,
        },
        policyId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "policy", key: "id" },
          name: "policyId",
          field: "policyId",
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
          defaultValue: 1,
          allowNull: false,
        },
        tipoTaquilla: {
          type: Sequelize.STRING,
          field: "tipoTaquilla",
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
          allowNull: true,
          defaultValue: Sequelize.NOW,
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
    fn: "createTable",
    params: [
      "user_role",
      {
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "user", key: "id" },
          primaryKey: true,
          name: "userId",
          field: "userId",
          allowNull: false,
        },
        roleId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "role", key: "id" },
          name: "roleId",
          field: "roleId",
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
