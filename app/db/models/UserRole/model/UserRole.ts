import { BaseModel } from "@/libraries/BaseModel";
import { Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { Role } from "../../Role/model/Role";
import { User } from "../../User/model/User";

@Table({
  tableName: "user_role",
})
export class UserRole extends BaseModel<UserRole> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  roleId: number;
}
