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
  })
  movieId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  duration: number; // Duración estimada en minutos

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
    type: DataType.TIME,
    allowNull: false,
  })
  startTime: string; // Fecha y hora de inicio de la función

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string; // Estado de la función, por ejemplo: "Programada", "Cancelada", "En curso"

  @HasMany(() => ComprarTaquilla)
  comprasTaquilla: ComprarTaquilla[];

  // Hook antes de crear una Función
  @BeforeCreate
  // Hook antes de actualizar una Función
  @BeforeUpdate
  static async loadDurationHooks(funcion: Funcion) {
    await funcion.loadMovieDuration();
  }

  // Método para cargar la duración desde la entidad Movie
  async loadMovieDuration() {
    const movie = await Movie.findByPk(this.movieId);
    if (movie) {
      this.duration = movie.duration;
    }
  }

  // Método para programar una función
  static async scheduleFunction(datosFuncion: any): Promise<Funcion> {
    return await Funcion.create(datosFuncion);
  }

  // Método para cancelar una función
  static async cancelFunction(idFuncion: number): Promise<[number, Funcion[]]> {
    return await Funcion.update(
      { status: "Cancelada" },
      {
        where: { id: idFuncion },
      },
    );
  }
}
