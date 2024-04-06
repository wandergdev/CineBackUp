import { config } from "@/config";
import path from "path";
import { Sequelize, SequelizeOptions } from "sequelize-typescript";

const dbOptions: SequelizeOptions = {
  ...config.db,
  models: [path.join(__dirname, "/db/models/**/model/*.js")],
  define: {
    freezeTableName: true,
    timestamps: true,
  },
  pool: {
    max: 3,
    min: 0,
    idle: 0,
    acquire: 3000,
    evict: 10000,
  },
};

export const db = new Sequelize(dbOptions);

// Should be called in server
export async function setupDB(): Promise<any> {
  return await db.sync();
}

export async function setupDBClearData(): Promise<any> {
  return await db.sync({
    force: true,
  });
}

export async function setupDBAlterSchema(): Promise<any> {
  return await db.sync({
    alter: true,
  });
}

export async function printDBCreateSQL(): Promise<any> {
  return await db.sync({
    logging: data => {
      // Clean output
      data = data.replace("Executing (default): ", "");
      if (data.indexOf("SHOW INDEX FROM") != -1) return;
      console.log(data);
    },
  });
}
