import { BaseModel } from "@/libraries/BaseModel";
import { Column, DataType, Table } from "sequelize-typescript";

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
  gener: string[];

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
}
