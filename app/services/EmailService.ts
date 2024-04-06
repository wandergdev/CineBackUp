import { config } from "@/config";
import { EmailData } from "@/db/interfaces/Email/Email.interfaces";
import i18n from "@/libraries/i18n";
import { log } from "@/libraries/Log";
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

class EmailService {
  mailer: nodemailer.Transporter;

  constructor() {
    this.mailer = nodemailer.createTransport({
      pool: true,
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth,
    });
  }

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

  async sendEmail(emailData: EmailData): Promise<any> {
    if (emailData.context == null) emailData.context = {};
    emailData.context.page = emailData.page;

    const t: any = {};
    i18n.init(t);
    if (emailData.locale == null) emailData.locale = "en";
    t.setLocale(emailData.locale);

    emailData.context.__ = t.__;

    // Translate subject
    emailData.subject = t.__(emailData.subject);

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
