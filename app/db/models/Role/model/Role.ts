import { BaseModel } from "@/libraries/BaseModel";
import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Table,
} from "sequelize-typescript";
import { Policy } from "../../Policy/model/Policy";
import { RolePolicy } from "../../RolePolicy/model/RolePolicy";
import { User } from "../../User/model/User";
import { UserRole } from "../../UserRole/model/UserRole";

@Table({
  tableName: "role",
})
export class Role extends BaseModel<Role> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "",
  })
  label: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  isDefault: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPrivate: boolean;

  @HasMany(() => RolePolicy, {
    hooks: true,
    onDelete: "CASCADE",
  })
  rolePolicies: RolePolicy[];

  @BelongsToMany(() => Policy, {
    through: {
      model: () => RolePolicy,
      unique: false,
    },
    constraints: false,
  })
  policies: Policy[];

  @HasMany(() => UserRole, {
    hooks: true,
    onDelete: "CASCADE",
  })
  userRoles: UserRole[];

  @BelongsToMany(() => User, {
    through: {
      model: () => UserRole,
      unique: false,
    },
    constraints: false,
  })
  users: User[];

  async addPolicy(policyId: number): Promise<void> {
    return RolePolicy.create({
      roleId: this.id,
      policyId,
    }).then(() => {
      return null;
    });
  }
}
