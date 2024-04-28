import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { BaseModel } from "@/libraries/BaseModel";
import { Funcion } from "../../Funcion/model/Funcion";
import { User } from "../../User/model/User";

@Table({
  tableName: "sala",
  timestamps: true,
})
export class Sala extends BaseModel<Sala> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  capacity: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User)
  user: User;

  // Relación uno a muchos con Función
  @HasMany(() => Funcion)
  funciones: Funcion[];

  // Método para añadir una sala
  static async addSala(datosSala: any): Promise<Sala> {
    return await Sala.create(datosSala);
  }

  // Método para actualizar una sala
  static async updateSala(
    id: number,
    datosSala: any,
  ): Promise<[number, Sala[]]> {
    return await Sala.update(datosSala, {
      where: { id },
    });
  }
}
