import { config } from "@/config";
import { EmailData } from "@/db/interfaces/Email/Email.interfaces";
import { JWTBlacklist } from "@/db/models/JWTBlacklist/model/JWTBlacklist";
import { Profile } from "@/db/models/Profile/model/Profile";
import { Role } from "@/db/models/Role/model/Role";
import { User } from "@/db/models/User/model/User";
import { MailNotFound } from "@/errors/emailauth/MailNotFound";
import { PasswordNotVerified } from "@/errors/emailauth/PasswordNotVerified";
import { UnauthorizedUser } from "@/errors/user/UnauthorizedUser";
import {
  Controller,
  handleServerError,
  parseBody,
} from "@/libraries/Controller";
import { log } from "@/libraries/Log";
import { validateBody } from "@/libraries/Validator";
import { validateJWT, validateJWTOnQueryString } from "@/policies/General";
import authService, {
  AuthCredentials,
  JWTPayload,
} from "@/services/AuthService";
import {
  createUserFromEmail,
  emailLoginCredentials,
  emailResetUserPassword,
} from "@/services/EmailAuthService";
import mailer from "@/services/EmailService";
import { EmailTemplate } from "@/utils/EmailTemplate";
import {
  AuthChangeSchema,
  AuthCreatePasswordSchema,
  AuthLoginSchema,
  AuthRegisterSchema,
  AuthResendConfirmSchema,
  AuthResetPasswordSchema,
  AuthResetPostSchema,
} from "@/validators/Auth";
import { Request, Response, Router } from "express";

export class EmailAuthController extends Controller {
  constructor() {
    super();
    this.name = "emailauth";
  }

  routes(): Router {
    this.router.post("/login", validateBody(AuthLoginSchema), (req, res) =>
      this.login(req, res),
    );

    this.router.post(
      "/register",
      validateBody(AuthRegisterSchema),
      (req, res) => this.register(req, res),
    );

    this.router.post(
      "/reset-password",
      validateBody(AuthResetPasswordSchema),
      (req, res) => this.resetPassword(req, res),
    );

    this.router.post(
      "/create-new-password",
      validateJWTOnQueryString("reset", "tk"),
      validateBody(AuthCreatePasswordSchema),
      (req, res) => this.createPassword(req, res),
    );

    this.router.get("/reset", (req, res) => this.resetGet(req, res));

    this.router.post("/reset", validateBody(AuthResetPostSchema), (req, res) =>
      this.resetPost(req, res),
    );

    this.router.post(
      "/change",
      validateJWT("access"),
      validateBody(AuthChangeSchema),
      (req, res) => this.changePassword(req, res),
    );

    this.router.get("/confirm", (req, res) => this.confirmEmail(req, res));

    this.router.post(
      "/resendconfirm",
      validateBody(AuthResendConfirmSchema),
      (req, res) => this.resendConfirmEmail(req, res),
    );

    return this.router;
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const loginCredentials = await emailLoginCredentials({ email, password });
      return Controller.ok(res, loginCredentials);
    } catch (err) {
      if (err instanceof MailNotFound) {
        return Controller.notFound(res, err.message);
      }
      if (err instanceof PasswordNotVerified) {
        return Controller.badRequest(res, err.message);
      }
      if (err instanceof UnauthorizedUser) {
        return Controller.unauthorized(res, err.message);
      }
      return handleServerError(err, res);
    }
  }

  async register(req: Request, res: Response) {
    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };

    const locale: Profile["locale"] | undefined = req.body.locale;
    const timezone: string | undefined = req.body.timezone;

    if (!newUser.email || !newUser.password) {
      return Controller.badRequest(res);
    }

    const lowerCaseEmail = newUser.email.toLowerCase();
    try {
      if (config.emailAuth.requireEmailConfirmation) {
        const user = await User.findOne({
          where: {
            email: lowerCaseEmail,
            isActive: false,
            isEmailConfirmed: false,
          },
        });

        if (user) {
          return Controller.conflict(res, "email pending validation");
        }
      }

      const createUser: User = await createUserFromEmail({
        email: lowerCaseEmail,
        password: newUser.password,
        name: newUser.name,
      });

      const findCreatedUser = await User.findOne({
        where: { id: createUser.id },
        include: [
          { model: Profile, as: "profile" },
          { model: Role, as: "roles" },
        ],
      });

      if (locale) {
        findCreatedUser.profile.locale = locale;
      }

      if (timezone) {
        findCreatedUser.profile.time_zone = timezone;
      }

      await findCreatedUser.profile.save();
      if (config.emailAuth.requireEmailConfirmation) {
        try {
          const info = await this.handleSendConfirmEmail(findCreatedUser.email);
          log.info(info);
        } catch (err) {
          log.error(err);
          switch (err.error) {
            case "badRequest":
              return Controller.badRequest(res, err.msg);
            case "notFound":
              return Controller.notFound(res, err.msg);
            case "serverError":
              return Controller.serverError(res, err.msg);
            default:
              return Controller.serverError(res);
          }
        }

        return Controller.ok(res, "Please check your email inbox.");
      }

      const credentials = authService.getCredentials(findCreatedUser);
      return Controller.ok(res, credentials);
    } catch (err) {
      if (
        err.errors &&
        err.errors.length &&
        err.errors[0].type === "unique violation" &&
        err.errors[0].path === "email"
      ) {
        return Controller.forbidden(res, "email in use");
      } else if (err) {
        return Controller.serverError(res, err);
      }
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const emailSentInfo = await emailResetUserPassword(email);
      return Controller.ok(res, emailSentInfo);
    } catch (err) {
      if (err instanceof MailNotFound) {
        return Controller.notFound(res, err.message);
      }
      if (err instanceof PasswordNotVerified) {
        return Controller.badRequest(res, err.message);
      }
      return handleServerError(err, res);
    }
  }

  async createPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const userCredentials = await emailResetUserPassword(email);
      return Controller.ok(res, userCredentials);
    } catch (err) {
      if (err instanceof MailNotFound) {
        return Controller.notFound(res, err.message);
      }
      if (err instanceof PasswordNotVerified) {
        return Controller.badRequest(res, err.message);
      }
      return handleServerError(err, res);
    }
  }

  async resetGet(req: Request, res: Response) {
    const token: string =
      typeof req.query.token === "string" ? req.query.token : "";

    if (token === "") {
      return Controller.unauthorized(res);
    }
    try {
      const decoded = await authService.validateJWT(token, "reset");
      if (!decoded) {
        return Controller.unauthorized(res);
      }

      return res.redirect(`${config.emailAuth.passwordResetUrl}?tk=${token}`);
    } catch (err) {
      return Controller.unauthorized(res, err);
    }
  }

  async resetPost(req: Request, res: Response) {
    const { token, password } = req.body;

    if (token === "" || password === "") {
      const { email } = req.body;
      if (email === "") {
        return Controller.badRequest(res);
      }
      try {
        const info = await this.handleResetEmail(email);
        log.info(info);
        return Controller.ok(res);
      } catch (err) {
        log.error(err);
        switch (err.error) {
          case "badRequest":
            return Controller.badRequest(res, err.msg);
          case "notFound":
            return Controller.notFound(res, err.msg);
          case "serverError":
            return Controller.serverError(res, err.msg);
          default:
            return Controller.serverError(res);
        }
      }
    }

    try {
      const credentials = await this.handleResetChPass(token, password);
      return Controller.ok(res, credentials);
    } catch (err) {
      log.error(err);
      switch (err.error) {
        case "badRequest":
          return Controller.badRequest(res, err.msg);
        case "notFound":
          return Controller.notFound(res, err.msg);
        case "serverError":
          return Controller.serverError(res, err.msg);
        default:
          return Controller.serverError(res);
      }
    }
  }

  async changePassword(req: Request, res: Response) {
    const { email = "", oldPass = "", newPass = "" } = req.body;
    const haveRequiredInfo = email !== "" && oldPass !== "" && newPass !== "";

    if (!haveRequiredInfo) {
      return Controller.badRequest(res);
    }

    if (email != req.session.jwt.email) {
      return Controller.unauthorized(res);
    }

    try {
      const user = await User.findOne<User>({
        where: { id: req.session.jwt.id },
        include: [
          { model: Profile, as: "profile" },
          { model: Role, as: "roles" },
        ],
      });

      if (!user) {
        return Controller.notFound(res);
      }

      const authenticated = await user.authenticate(oldPass);
      if (!authenticated) {
        return Controller.unauthorized(res);
      }

      user.password = newPass;
      await user.save();
      const credentials = authService.getCredentials(user);
      return Controller.ok(res, credentials);
    } catch (err) {
      log.error(err);
      return Controller.serverError(res);
    }
  }

  async confirmEmail(req: Request, res: Response) {
    const { tk } = req.query;

    try {
      console.log("Token received:", tk);
      const decoded = await authService.validateJWT(
        tk as string,
        "confirmEmail",
      );
      console.log("Decoded token:", decoded);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.redirect(
          `http://localhost:3000/?success=false&email=${decoded.email}`,
        );
      }

      user.isEmailConfirmed = true;
      await user.save();

      // Redirigir a la página principal
      return res.redirect(
        `http://localhost:3000/?success=true&email=${user.email}`,
      );
    } catch (err) {
      log.error(err);
      return res.redirect(
        `http://localhost:3000/?success=false&email=${req.query.email}`,
      );
    }
  }

  private async handleResetEmail(email: string): Promise<any> {
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({
      where: { email: lowerCaseEmail },
      include: [
        { model: Profile, as: "profile" },
        { model: Role, as: "roles" },
      ],
    });

    if (!user) {
      throw { error: "notFound", msg: "Email not found" };
    }

    const token = authService.createToken({
      email: user.email,
      uid_azure: user.uid_azure,
      role: user.roles,
      type: "reset",
      userId: user.id,
    });
    return this.sendEmailNewPassword(user, token.token, user.name);
  }

  private async handleResetChPass(
    token: string,
    password: string,
  ): Promise<AuthCredentials> {
    let decoded: JWTPayload;

    try {
      decoded = await authService.validateJWT(token, "reset");
      if (!decoded) {
        throw { error: "unauthorized", msg: "Invalid Token" };
      }
    } catch (err) {
      log.error(err);
      throw { error: "unauthorized", msg: err };
    }

    try {
      const user = await User.findOne({
        where: { id: decoded.id },
        include: [
          { model: Profile, as: "profile" },
          { model: Role, as: "roles" },
        ],
      });

      if (!user) {
        throw { error: "unauthorized" };
      }

      user.password = password;
      await user.save();

      JWTBlacklist.create({
        token: token,
        expires: new Date(decoded.exp * 1000),
      }).catch(err => {
        log.error(err);
      });

      this.sendEmailPasswordChanged(user);

      const credentials = authService.getCredentials(user);
      return credentials;
    } catch (err) {
      log.error(err);
      throw { error: "badRequest", msg: err };
    }
  }

  private async sendEmailPasswordChanged(
    user: User,
    name?: string,
  ): Promise<any> {
    const emailData: EmailData = {
      email: user.email,
      subject: "Password restored",
      page: EmailTemplate.PasswordChanged,
      locale: user.profile.locale,
      context: { name: name || user.email },
    };
    const info = await mailer.sendEmail(emailData);

    log.debug("Sending password changed email to:", user.email, info);
    return info;
  }

  private async sendEmailNewPassword(
    user: User,
    token: string,
    name?: string,
  ): Promise<any> {
    const emailData: EmailData = {
      email: user.email,
      subject: "Instructions for restoring your password",
      page: EmailTemplate.PasswordRecovery,
      locale: user.profile?.locale ?? "en",
      context: {
        url: `${config.email.routes.passwordRecovery}?tk=${token}`,
        name: name || user.email,
      },
    };

    const info = await mailer.sendEmail(emailData);

    log.debug("Sending password recovery email to:", user.email, info);
    return info;
  }

  async handleSendConfirmEmail(email: string): Promise<any> {
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({
      where: { email: lowerCaseEmail },
      include: [
        { model: Profile, as: "profile" },
        { model: Role, as: "roles" },
      ],
    });

    if (!user) {
      throw { error: "notFound", msg: "Email not found" };
    }

    const token = authService.createToken({
      email: user.email,
      userId: user.id, // Asegúrate de incluir el ID del usuario
      role: user.roles,
      type: "confirmEmail",
    });
    return this.sendEmailConfirm(user, token.token, user.name);
  }

  private async sendEmailConfirm(
    user: User,
    token: string,
    name?: string,
  ): Promise<any> {
    const emailData: EmailData = {
      email: user.email,
      subject: "Welcome!, please verify your email address.",
      page: EmailTemplate.EmailConfirm,
      locale: user.profile?.locale ?? "en",
      context: {
        url: `http://localhost:3000/confirm-email?tk=${token}`, // Ajusta la URL según tu configuración
        name: name || user.email,
        email: user.email,
      },
    };

    const info = await mailer.sendEmail(emailData);

    log.debug("Sending email confirm email to:", user.email, info);
    return info;
  }

  async resendConfirmEmail(req: Request, res: Response) {
    const { email } = parseBody(req);

    if (!email) {
      return Controller.badRequest(res);
    }

    if (!config.emailAuth.requireEmailConfirmation) {
      return Controller.notFound(res);
    }

    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({
      where: {
        email: lowerCaseEmail,
        isActive: false,
        isEmailConfirmed: false,
      },
    });

    if (!user) {
      return Controller.notFound(res);
    }

    try {
      const info = await this.handleSendConfirmEmail(user.email);
      log.info(info);
    } catch (err) {
      log.error(err);
      switch (err.error) {
        case "badRequest":
          return Controller.badRequest(res, err.msg);
        case "notFound":
          return Controller.notFound(res, err.msg);
        case "serverError":
          return Controller.serverError(res, err.msg);
        default:
          return Controller.serverError(res);
      }
    }

    return Controller.ok(res, "Please check your email inbox.");
  }
}

const controller = new EmailAuthController();
export default controller;
