import { config } from "@/config";
import { EmailData } from "@/db/interfaces/Email/Email.interfaces";
import { User } from "@/db/models/User/model/User";
import i18n from "@/libraries/i18n";
import { log } from "@/libraries/Log";
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import QRCode from "qrcode"; // Asegúrate de tener qrcode instalado
import fs from "fs";
import os from "os";
import { ComprarTaquilla } from "@/db/models/ComprarTaquilla/model/ComprarTaquilla";

class EmailService {
  mailer: nodemailer.Transporter;

  constructor() {
    // Configuración del transportador de nodemailer
    this.mailer = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure, // true for 465, false for other ports
      auth: {
        user: config.email.auth.user, // generated ethereal user
        pass: config.email.auth.pass, // generated ethereal password
      },
    });
  }

  /**
   * Envía un correo electrónico utilizando nodemailer.
   * @param email - Dirección de correo del destinatario.
   * @param subject - Asunto del correo.
   * @param html - Contenido HTML del correo.
   * @param attachments - Archivos adjuntos del correo.
   * @returns Una promesa con el resultado del envío.
   */
  private send(
    email: string,
    subject: string,
    html: string,
    attachments: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mailer.sendMail(
        {
          from: config.email.from_address,
          to: email,
          subject: subject,
          html: html,
          attachments: attachments,
        },
        (err, info: any) => {
          if (err) return reject(err);
          return resolve(info);
        },
      );
    });
  }

  /**
   * Compila una plantilla EJS con el contexto proporcionado.
   * @param context - Datos para renderizar la plantilla.
   * @returns Una promesa con el contenido HTML renderizado.
   */
  private compileTemplate(context: any): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(
        path.join(__dirname, `../views/email/${context.page}.ejs`),
        context,
        (err, str) => {
          if (err) return reject(err);
          return resolve(str);
        },
      );
    });
  }

  /**
   * Genera un código QR basado en los datos proporcionados.
   * @param data - Datos para codificar en el código QR.
   * @returns Una promesa con el código QR en formato base64.
   */
  async generateQRCodeFile(ticketId: string): Promise<string> {
    try {
      const url = `http://192.168.100.7:3000/ticket/${ticketId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(url);
      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
      const tempFilePath = path.join(os.tmpdir(), `qrcode-${Date.now()}.png`);
      await fs.promises.writeFile(tempFilePath, base64Data, "base64");

      // Verificar que el archivo se haya creado correctamente
      if (!fs.existsSync(tempFilePath)) {
        throw new Error("El archivo del QR code no se creó correctamente.");
      }

      return tempFilePath;
    } catch (err) {
      log.error(`Error generating QR code: ${err}`);
      throw new Error("Error generating QR code");
    }
  }

  /**
   * Envía un correo electrónico con los datos de la compra de taquilla.
   * @param userId - ID del usuario que realizó la compra.
   * @param ticketData - Datos del ticket incluyendo función, cantidad de taquillas, tipo de taquilla y QR code.
   */

  async sendTicketEmail(userId: number, ticketData: any): Promise<any> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    if (!ticketData.funcion || !ticketData.funcion.movie || !ticketData.sala) {
      throw new Error("Datos incompletos para el ticket.");
    }

    console.log("Datos del ticket:", ticketData);

    const currentDateTime = new Date();
    const validUntil = new Date(currentDateTime);
    validUntil.setHours(23, 59, 59, 999); // válido hasta las 11:59:59 PM del día de la compra

    const ticketId = `Ticket-${userId}-${
      ticketData.funcion.id
    }-${currentDateTime.toISOString()}`;
    const qrCodeFilePath = await this.generateQRCodeFile(ticketId);

    const emailData: EmailData = {
      email: user.email,
      subject: "Tu compra de taquilla en Cinema Oasis",
      page: "ticket",
      context: {
        ...ticketData,
        name: user.name,
        validUntil, // pasar la fecha de validez al contexto
      },
      attachments: [
        {
          filename: "qrcode.png",
          path: qrCodeFilePath,
          cid: "qrcode@cinemaoasis",
        },
      ],
      locale: "",
    };

    // Guardar la compra de taquilla con la validez y el estado de escaneo
    await ComprarTaquilla.create({
      userId,
      funcionId: ticketData.funcion.id,
      cantidadTaquillas: ticketData.cantidadTaquillas,
      tipoTaquilla: ticketData.tipoTaquilla,
      costoTotal: ticketData.costoTotal,
      fechaHoraCompra: currentDateTime,
      estadoTransaccion: "Completada",
      qrCode: ticketId,
      validUntil,
      scanned: false,
    });

    await this.sendEmail(emailData);
    await fs.promises.unlink(qrCodeFilePath);
  }

  /**
   * Envía un correo electrónico con los datos proporcionados.
   * @param emailData - Datos del correo electrónico (dirección, asunto, plantilla, contexto, adjuntos).
   * @returns Una promesa con el resultado del envío.
   */
  async sendEmail(emailData: EmailData): Promise<any> {
    if (emailData.context == null) emailData.context = {};
    emailData.context.page = emailData.page;

    const t: any = {};
    i18n.init(t);
    if (emailData.locale == null) emailData.locale = "en";
    t.setLocale(emailData.locale);

    emailData.context.__ = t.__;

    // Asegúrate de pasar el email, name y url al contexto
    emailData.context.email = emailData.email;
    emailData.context.name = emailData.context.name || emailData.email;
    emailData.context.url = emailData.context.url || "";

    // Traducir asunto
    emailData.subject = t.__(emailData.subject);

    // Generar el código QR
    if (emailData.context.ticketId) {
      const qrCodeData = await this.generateQRCodeFile(
        `Ticket-${emailData.context.ticketId}`,
      );
      emailData.context.qrCode = qrCodeData;
    }

    const html = await this.compileTemplate(emailData.context);
    log.debug(`Sending ${emailData.page} email to: ${emailData.email}`);
    return await this.send(
      emailData.email,
      emailData.subject,
      html,
      emailData.attachments,
    );
  }
}

const emailService = new EmailService();
export default emailService;
