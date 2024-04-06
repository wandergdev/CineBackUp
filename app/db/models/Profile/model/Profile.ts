import { BaseModel } from "@/libraries/BaseModel";
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from "sequelize-typescript";
import { User } from "../../User/model/User";

@Table({
  tableName: "profile",
})
export class Profile extends BaseModel<Profile> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  time_zone: string;

  @Column({
    type: DataType.ENUM("en", "es"),
    allowNull: true,
  })
  locale: "en" | "es";

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
