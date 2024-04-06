import { BaseModel } from "@/libraries/BaseModel";
import { Column, DataType, HasMany, Table } from "sequelize-typescript";
import { RolePolicy } from "../../RolePolicy/model/RolePolicy";
import { PermissionData } from "../types/PermissionData";

@Table({
  tableName: "policy",
})
export class Policy extends BaseModel<Policy> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  permission: PermissionData;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  isSystemManaged: boolean;

  @HasMany(() => RolePolicy, {
    hooks: true,
    onDelete: "CASCADE",
  })
  rolePolicies: RolePolicy[];
}
