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
  emailCreateUserPassword,
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
    /**
     * @swagger
     * tags:
     *   - name: Email Auth
     *     description: User authorization managing by email
     */

    /**
     * @swagger
     * components:
     *   schemas:
     *     LoginUserEmail:
     *       type: object
     *       required:
     *         - email
     *         - password
     *       properties:
     *         email:
     *           type: string
     *           format: email
     *           maxLength: 255
     *           example: user@example.com
     *         password:
     *           type: string
     *           format: password
     *           minimum: 8
     *           maximum: 255
     *           example: "12345678"
     *
     *     ResendUserEmail:
     *       type: object
     *       required:
     *         - email
     *       properties:
     *         email:
     *           type: string
     *           format: email
     *           maxLength: 255
     *           example: user@example.com
     *
     *     ChangePassword:
     *       type: object
     *       required:
     *         - email
     *         - oldPass
     *         - newPass
     *       properties:
     *         email:
     *           type: string
     *           format: email
     *           maxLength: 255
     *           example: user@example.com
     *         oldPass:
     *           type: string
     *           format: password
     *           minimum: 8
     *           maximum: 255
     *           example: "123453434"
     *         newPass:
     *           type: string
     *           format: password
     *           minimum: 8
     *           maximum: 255
     *           example: "12345678"
     *
     *     ResetToken:
     *       type: object
     *       required:
     *         - email
     *         - password
     *       properties:
     *         email:
     *           type: string
     *           format: email
     *           maxLength: 255
     *           example: user@example.com
     *         password:
     *           type: string
     *           format: password
     *           minimum: 8
     *           maximum: 255
     *           example: "12345678"
     *         token:
     *           type: string
     *           minimum: 8
     *           maximum: 255
     *           example: >-
     *             eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
     *             SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     *
     *     RegisterUserEmail:
     *       type: object
     *       required:
     *         - email
     *         - password
     *       properties:
     *         email:
     *           type: string
     *           format: email
     *           maxLength: 255
     *           example: user@example.com
     *         password:
     *           type: string
     *           format: password
     *           minimum: 8
     *           maximum: 255
     *           example: "12345678"
     *         locale:
     *           type: string
     *           enum: [es, en]
     *           example: "en"
     *         timezone:
     *           type: string
     *           example: "PDT"
     *
     *     Token:
     *       type: object
     *       properties:
     *         token:
     *           type: string
     *           example: >-
     *             eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
     *             SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     *
     */

    /**
     * @swagger
     * components:
     *   requestBodies:
     *     LoginUser:
     *       required: true
     *       description: User credentials to perform login
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginUserEmail'
     *
     *     RegisterUser:
     *       required: true
     *       description: Register user
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterUserEmail'
     *
     *     ResetUserToken:
     *       required: true
     *       description: Reset user token
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ResetToken'
     *
     *     ChangePassword:
     *       required: true
     *       description: Change user password
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ChangePassword'
     *
     *     ResentEmailConfirmation:
     *       required: true
     *       description: Send email confirmation
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ResendUserEmail'
     *
     */

    /**
     * @swagger
     * /emailauth/login:
     *   post:
     *     tags:
     *       - Email Auth
     *     summary: Login the user
     *     description: Creates user credentials which grants access to other endpoints.
     *     operationId: Login
     *     responses:
     *       '201':
     *         description: The request has succeeded and a new session has been created as a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/CreatedResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/Token'
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/LoginUser'
     */
    this.router.post("/login", validateBody(AuthLoginSchema), (req, res) =>
      this.login(req, res),
    );

    /**
     * @swagger
     * /emailauth/register:
     *   post:
     *     tags:
     *       - Email Auth
     *     summary: Register user
     *     description: Creates user entity.
     *     operationId: Register
     *     responses:
     *       '201':
     *         description: The request has succeeded and a new session has been created as a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - type: object
     *                   properties:
     *                      message:
     *                        type: string
     *                        example: OK
     *                      data:
     *                        type: string
     *                        example: Please check your email inbox.
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/RegisterUser'
     */
    this.router.post(
      "/register",
      validateBody(AuthRegisterSchema),
      (req, res) => this.register(req, res),
    );

    /**
     * @swagger
     * /emailauth/reset-password:
     *   post:
     *     tags:
     *       - Email Auth
     *     summary: Resets User Password
     *     description: Sends email to reset user password
     *     operationId: Reset
     *     responses:
     *       '201':
     *         description: The request has succeeded and a new session has been created as a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - type: object
     *                   properties:
     *                      message:
     *                        type: string
     *                        example: OK
     *                      data:
     *                        type: string
     *                        example: Please check your email inbox.
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/RegisterUser'
     */
    this.router.post(
      "/reset-password",
      validateBody(AuthResetPasswordSchema),
      (req, res) => this.resetPassword(req, res),
    );

    /**
     * @swagger
     * /emailauth/create-new-password:
     *   post:
     *     tags:
     *       - Email Auth
     *     summary: Creates New User Password
     *     description: Creates new password for user through email reset password template
     *     operationId: Create
     *     responses:
     *       '201':
     *         description: The request has succeeded and a new session has been created as a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - type: object
     *                   properties:
     *                      message:
     *                        type: string
     *                        example: OK
     *                      data:
     *                        type: string
     *                        example: Please check your email inbox.
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/RegisterUser'
     */
    this.router.post(
      "/create-new-password",
      validateJWTOnQueryString("reset", "tk"),
      validateBody(AuthCreatePasswordSchema),
      (req, res) => this.createPassword(req, res),
    );

    /**
     * @swagger
     * /emailauth/reset:
     *   get:
     *     tags:
     *       - Email Auth
     *     summary: Get Reset user token
     *     operationId: GetReset
     *     responses:
     *       '201':
     *         description: The request has succeeded and a new token has been created a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/CreatedResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/Token'
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.get("/reset", (req, res) => this.resetGet(req, res));

    /**
     * @swagger
     * /emailauth/reset:
     *   post:
     *     tags:
     *       - Email Auth
     *     summary: Reset user token
     *     operationId: Reset
     *     responses:
     *       '201':
     *         description: The request has succeeded and a new session has been created as a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - type: object
     *                   properties:
     *                      token:
     *                       $ref: '#/components/schemas/Token'
     *                      expires:
     *                        type: number
     *                        example: 1625762317.714
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/ResetUserToken'
     */
    this.router.post("/reset", validateBody(AuthResetPostSchema), (req, res) =>
      this.resetPost(req, res),
    );

    /**
     * @swagger
     * /emailauth/change:
     *   post:
     *     tags:
     *       - Email Auth
     *     summary: Change user password
     *     operationId: ChangePassword
     *     responses:
     *       '201':
     *         description: The request has succeeded and a new password has been created as a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - type: object
     *                   properties:
     *                      token:
     *                       $ref: '#/components/schemas/Token'
     *                      expires:
     *                        type: number
     *                        example: 1625762317.714
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/ChangePassword'
     */
    this.router.post(
      "/change",
      validateJWT("access"),
      validateBody(AuthChangeSchema),
      (req, res) => this.changePassword(req, res),
    );

    /**
     * @swagger
     * /emailauth/confirm:
     *   get:
     *     tags:
     *       - Email Auth
     *     summary: Confirm user email.
     *     description: Return the home page if the confirmation is successfully.
     *     operationId: ConfirmEmail
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: token
     *         description: |
     *           User token
     *         required: true
     *     responses:
     *       '200':
     *         description: The request has succeeded.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessfulResponse'
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *
     */
    this.router.get(
      "/confirm",
      validateJWTOnQueryString("confirmEmail", "tk"),
      (req, res) => this.confirmEmail(req, res),
    );

    /**
     * @swagger
     * /emailauth/resendconfirm:
     *   post:
     *     tags:
     *       - Email Auth
     *     summary: Resend confirm
     *     operationId: ResendConfirm
     *     responses:
     *       '201':
     *         description: The request has succeeded and a new email confirm has been sent as a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - type: object
     *                   properties:
     *                      message:
     *                        type: string
     *                        example: OK
     *                      data:
     *                        type: string
     *                        example: Please check your email inbox.
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/ResentEmailConfirmation'
     */
    this.router.post(
      "/resendconfirm",
      validateBody(AuthResendConfirmSchema),
      (req, res) => this.resendConfirmEmail(req, res),
    );

    return this.router;
  }

  async login(req: Request, res: Response) {
    try {
      const email = req.body.email;
      const password = req.body.password;

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

    // Optional extra params:
    const locale: Profile["locale"] | undefined = req.body.locale;
    const timezone: string | undefined = req.body.timezone;

    // Validate
    if (!newUser.email || !newUser.password) {
      return Controller.badRequest(res);
    }

    const lowerCaseEmail = newUser.email.toLowerCase();
    try {
      if (config.emailAuth.requireEmailConfirmation) {
        // Validate if user exists but hasn't been confirmed
        const user = await User.findOne({
          where: {
            email: lowerCaseEmail,
            isActive: false,
            isEmailConfirmed: false,
          },
        });

        if (user) {
          // User existis but email hasn't been confirmed
          return Controller.conflict(res, "email pending validation");
        }
      }

      const createUser: User = await createUserFromEmail({
        email: lowerCaseEmail,
        password: newUser.password,
        name: newUser.name,
      });
      // We need to do another query because before the profile wasn't ready
      // We need to do another query because before the role wasn't ready
      const findCreatedUser = await User.findOne({
        where: { id: createUser.id },
        include: [
          { model: Profile, as: "profile" },
          { model: Role, as: "roles" },
        ],
      });
      // Set extra params:
      if (locale) {
        findCreatedUser.profile.locale = locale;
      }

      if (timezone) {
        findCreatedUser.profile.time_zone = timezone;
      }

      await findCreatedUser.profile.save();
      if (config.emailAuth.requireEmailConfirmation) {
        // Send Email Confirmation email
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
      const email = req.body.email;

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
      const email = req.session.user.email;
      const password = req.body.password;

      const userCredentials = await emailCreateUserPassword({
        email,
        password,
      });

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
    // Decode token
    try {
      const decodedjwt = await authService.validateJWT(token, "reset");
      if (!decodedjwt) {
        return Controller.unauthorized(res);
      }

      return res.redirect(`${config.emailAuth.passwordResetUrl}?tk=${token}`);
    } catch (err) {
      return Controller.unauthorized(res, err);
    }
  }

  /*
      This can serve two different use cases:
        1. Request sending of recovery token via email (body: { email: '...' })
        2. Set new password (body: { token: 'mytoken', password: 'newpassword' })
    */
  async resetPost(req: Request, res: Response) {
    const token: string = req.body.token;
    const password: string = req.body.password;

    if (token === "" || password === "") {
      const email: string = req.body.email;
      if (email === "") {
        return Controller.badRequest(res);
      }
      // case 1
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

    // case 2
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

    // Validate
    if (!haveRequiredInfo) {
      return Controller.badRequest(res);
    }

    // IMPORTANT: Check if email is the same as the one in the token
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
    const userId = req.session.jwt.id;
    const email = req.session.user.email;
    if (!userId) {
      return res.redirect(
        `${config.emailAuth.emailConfirmUrl}?success=false&email=${email}`,
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.redirect(
        `${config.emailAuth.emailConfirmUrl}?success=false&email=${email}`,
      );
    }

    user.isActive = true;
    user.isEmailConfirmed = true;
    await user.save();
    return res.redirect(
      `${config.emailAuth.emailConfirmUrl}?success=true&email=${email}`,
    );
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

    // Create reset token
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
    let decodedjwt: JWTPayload;

    try {
      decodedjwt = await authService.validateJWT(token, "reset");
      if (!decodedjwt) {
        throw { error: "unauthorized", msg: "Invalid Token" };
      }
    } catch (err) {
      log.error(err);
      throw { error: "unauthorized", msg: err };
    }

    try {
      // Save new password
      const user = await User.findOne({
        where: { id: decodedjwt.id },
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

      // Blacklist JWT asynchronously
      JWTBlacklist.create({
        token: token,
        expires: new Date(decodedjwt.exp * 1000),
      }).catch(err => {
        log.error(err);
      });

      this.sendEmailPasswordChanged(user); // We send it asynchronously, we don't care if there is a mistake

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

    // Create reset token
    const token = authService.createToken({
      email: user.email,
      uid_azure: user.uid_azure,
      role: user.roles,
      type: "confirmEmail",
      userId: user.id,
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
        url: `${config.urls.baseApi}/emailauth/confirm?tk=${token}`,
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
    // Validate if user exists but hasn't been confirmed
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
