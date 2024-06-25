// Movie.ts
import { BaseModel } from "@/libraries/BaseModel";
import { Column, DataType, Table, HasMany } from "sequelize-typescript";
import { Funcion } from "../../Funcion/model/Funcion";

@Table({
  tableName: "movie",
})
export class Movie extends BaseModel<Movie> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  duration: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  fecha_lanzamiento: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  poster_path: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  genero: string[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  rating: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  external_id: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  proximamente: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  trailer_key: string;

  @HasMany(() => Funcion, { onDelete: "CASCADE" }) // Asegura la eliminación en cascada
  funciones: Funcion[];
}
