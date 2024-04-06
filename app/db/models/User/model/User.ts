import { config } from "@/config";
import { BaseModel } from "@/libraries/BaseModel";
import bcrypt from "bcrypt";
import {
  AfterCreate,
  BeforeBulkCreate,
  BeforeBulkUpdate,
  BeforeCreate,
  BeforeDestroy,
  BeforeUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Table,
} from "sequelize-typescript";
import { Profile } from "../../Profile/model/Profile";
import { Role } from "../../Role/model/Role";
import { UserRole } from "../../UserRole/model/UserRole";
import { AuthType } from "../types/AuthType";

@Table({
  tableName: "user",
})
export class User extends BaseModel<User> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  uid_azure: string;

  // If the user can access the platform
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isActive: boolean;

  // If the user account has been confirmed after creation
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isEmailConfirmed: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    set(value: string) {
      const emailLowerCase = value.toLowerCase();
      this.setDataValue("email", emailLowerCase);
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isLength: {
        min: 8,
      },
    },
  })
  password: string;

  @Column({
    type: DataType.ENUM(AuthType.Email, AuthType.Microsoft, AuthType.Google),
    allowNull: false,
    defaultValue: AuthType.Email,
  })
  authType: AuthType.Email | AuthType.Microsoft | AuthType.Google;

  @HasOne(() => Profile, {
    hooks: true,
    onDelete: "CASCADE",
  })
  profile: Profile;

  @HasMany(() => UserRole, {
    hooks: true,
    onDelete: "CASCADE",
  })
  userRoles: UserRole[];

  @BelongsToMany(() => Role, {
    through: {
      model: () => UserRole,
      unique: false,
    },
    constraints: true,
  })
  roles: Role[];

  @BeforeBulkCreate
  @BeforeBulkUpdate
  static activateIndividualHooks(items: Array<User>, options: any) {
    options.individualHooks = true;
  }

  @BeforeCreate
  static initialize(user: User, _options: any) {
    // Check if we need to confirm the user email
    const needConfirm = config.emailAuth.requireEmailConfirmation;
    if (!needConfirm) {
      user.isActive = true;
      user.isEmailConfirmed = true;
    }
    return user.updatePassword();
  }

  @AfterCreate
  static createProfile(user: User, _options: any) {
    return user.addProfile();
  }

  @BeforeUpdate
  static changePassword(user: User, _options: any) {
    if (user.changed("password")) {
      return user.updatePassword();
    }
    return Promise.resolve();
  }

  @BeforeDestroy
  static deleteChilds(user: User, _options: any) {
    return Promise.all([Profile.destroy({ where: { userId: user.id } })]);
  }

  authenticate(password: string): Promise<boolean> {
    if (!this.isActive) {
      return Promise.resolve(false);
    }
    return bcrypt.compare(password, this.password);
  }

  hashPassword(password: string): Promise<string> {
    if (password == null || password.length < 8)
      throw new Error("Invalid password");
    return bcrypt.hash(password, 10);
  }

  async updatePassword(): Promise<void> {
    const result = await this.hashPassword(this.password);
    this.password = result;
    return null;
  }

  async addProfile(): Promise<void> {
    return Profile.create({
      time_zone: "America/Mexico_City",
      userId: this.id,
      locale: "en", // Defaults, this should be changed in auth controller on register.
    }).then(() => {
      return null;
    });
  }

  async addRole(roleId: number): Promise<void> {
    return UserRole.create({
      userId: this.id,
      roleId,
    }).then(() => {
      return null;
    });
  }

  toJSON() {
    const object: any = super.toJSON();
    delete object.role;
    delete object.password;
    delete object.createdAt;
    delete object.updatedAt;
    return object;
  }
}
