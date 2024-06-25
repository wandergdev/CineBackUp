// Funcion.ts
import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import { BaseModel } from "@/libraries/BaseModel";
import { Movie } from "../../Movie/model/Movie";
import { Sala } from "../../Sala/model/Sala";
import { ComprarTaquilla } from "../../ComprarTaquilla/model/ComprarTaquilla";

@Table({
  tableName: "funcion",
})
export class Funcion extends BaseModel<Funcion> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Movie)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: "CASCADE", // Asegura la eliminación en cascada
  })
  movieId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  duration: number;

  @BelongsTo(() => Movie)
  movie: Movie;

  @ForeignKey(() => Sala)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  salaId: number;

  @BelongsTo(() => Sala)
  sala: Sala;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  startTime: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  endTime: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPremiere: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isWeekend: boolean;

  @HasMany(() => ComprarTaquilla)
  comprasTaquilla: ComprarTaquilla[];

  @BeforeCreate
  @BeforeUpdate
  static async loadDurationHooks(funcion: Funcion) {
    await funcion.loadMovieDuration();
    funcion.calculateEndTime();
  }

  async loadMovieDuration() {
    const movie = await Movie.findByPk(this.movieId);
    if (movie) {
      this.duration = movie.duration;
    }
  }

  calculateEndTime() {
    this.endTime = this.startTime + this.duration;
  }
}
