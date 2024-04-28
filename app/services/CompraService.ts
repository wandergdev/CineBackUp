import { ComprarTaquilla } from "../db/models/ComprarTaquilla/model/ComprarTaquilla";
import { PrecioTaquillas } from "../db/models/PrecioTaquillas/model/PrecioTaquillas";
import { DatabaseError } from "sequelize";

class CompraService {
  async comprarTaquilla(
    userId: number,
    funcionId: number,
    tipoTaquilla: string,
    cantidad: number,
  ) {
    // Obtener el precio de la taquilla según el tipo
    const precio = await PrecioTaquillas.findOne({
      where: { name: tipoTaquilla },
    });

    if (!precio) {
      throw new Error("Tipo de taquilla no disponible");
    }

    const costoTotal = precio.precio * cantidad;

    // Crear la compra de taquilla
    const compra = await ComprarTaquilla.create({
      userId,
      funcionId,
      cantidadTaquillas: cantidad,
      costoTotal: costoTotal,
      fechaHoraCompra: new Date(),
      estadoTransaccion: "Completada",
    });

    return compra;
  }

  // Implementar métodos adicionales según sea necesario
}
