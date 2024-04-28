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
import { Funcion } from "../../Funcion/model/Funcion"; // Asegúrate de que la importación sea correcta

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
    defaultValue: 1, //Default is 1 ticket per purchase if not specified
  })
  cantidadTaquillas: number; // Cantidad de taquillas compradas

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tipoTaquilla: string; //Tipo taquilla, "Regular o VIP".

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  costoTotal: number; // Costo total de la compra

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW, //Fecha y hora automática.
    allowNull: true,
  })
  fechaHoraCompra: Date; // Fecha y hora de la compra

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  estadoTransaccion: string; // Estado de la transacción, ej. "Completada", "Cancelada"

  //Hook para calcular el costo antes de crear la entrada.

  @BeforeCreate
  static async calcularCosto(instancia: ComprarTaquilla) {
    const precioBase = instancia.tipoTaquilla === "VIP" ? 250 : 150;
    instancia.costoTotal = precioBase * instancia.cantidadTaquillas;
  }
  static setPurchaseTimestamp(instance: ComprarTaquilla): void {
    instance.fechaHoraCompra = new Date();
  }
  // Método para realizar una compra
  static async realizarCompra(datosCompra: any): Promise<ComprarTaquilla> {
    return await ComprarTaquilla.create(datosCompra);
  }

  // Método para cancelar una compra
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
