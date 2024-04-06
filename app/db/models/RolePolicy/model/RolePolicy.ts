import { BaseModel } from "@/libraries/BaseModel";
import { Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { Policy } from "../../Policy/model/Policy";
import { Role } from "../../Role/model/Role";

@Table({
  tableName: "role_policy",
})
export class RolePolicy extends BaseModel<RolePolicy> {
  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  roleId: number;

  @ForeignKey(() => Policy)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  policyId: number;
}
