import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeCreate,
} from "sequelize-typescript";
import { BaseModel } from "@/libraries/BaseModel";
import { User } from "../../User/model/User";
import { Funcion } from "../../Funcion/model/Funcion";

@Table({
  tableName: "comprartaquilla",
})
export class ComprarTaquilla extends BaseModel<ComprarTaquilla> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Funcion)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  funcionId: number;

  @BelongsTo(() => Funcion)
  funcion: Funcion;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  cantidadTaquillas: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tipoTaquilla: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  costoTotal: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: true,
  })
  fechaHoraCompra: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  estadoTransaccion: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  qrCode: string; // QR Code generado

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  validUntil: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  scanned: boolean;

  @BeforeCreate
  static async calcularCosto(instancia: ComprarTaquilla) {
    const precioBase = instancia.tipoTaquilla === "VIP" ? 250 : 150;
    instancia.costoTotal = precioBase * instancia.cantidadTaquillas;
    ComprarTaquilla.setPurchaseTimestamp(instancia);
  }

  static setPurchaseTimestamp(instance: ComprarTaquilla): void {
    instance.fechaHoraCompra = new Date();
  }

  static async realizarCompra(datosCompra: any): Promise<ComprarTaquilla> {
    // Calcular la validez del código QR
    const currentDateTime = new Date();
    const validUntil = new Date(currentDateTime);
    validUntil.setHours(23, 59, 59, 999); // válido hasta las 11:59:59 PM del día de la compra
    datosCompra.validUntil = validUntil;
    return await ComprarTaquilla.create(datosCompra);
  }

  static async cancelarCompra(
    idCompra: number,
  ): Promise<[number, ComprarTaquilla[]]> {
    return await ComprarTaquilla.update(
      { estadoTransaccion: "Cancelada" },
      {
        where: { id: idCompra },
      },
    );
  }
}
