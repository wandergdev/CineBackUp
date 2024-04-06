import { JWTBlacklist } from "@/db/models/JWTBlacklist/model/JWTBlacklist";
import { Role } from "@/db/models/Role/model/Role";
import { User } from "@/db/models/User/model/User";
import { Controller } from "@/libraries/Controller";
import { atLeastOneTypeIsInToken, validateJWT } from "@/policies/General";
import authService, { JWTPayload } from "@/services/AuthService";
import { Request, Response, Router } from "express";
import _ from "lodash";

export class AuthController extends Controller {
  constructor() {
    super();
    this.name = "auth";
  }

  routes(): Router {
    /**
     * @swagger
     * tags:
     *   - name: Auth
     *     description: User authorization managing
     */

    /**
     * @swagger
     * '/auth/validate-token':
     *   get:
     *     tags:
     *       - Auth
     *     summary: Validate User token
     *     operationId: authValidateToken
     *     responses:
     *       '201':
     *         description: Validate the token to let know if it has access
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessfulResponse'
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.get(
      "/validate-token",
      atLeastOneTypeIsInToken(["access", "reset"]),
      (req, res) => this.handleValidToken(req, res),
    );

    /**
     * @swagger
     * '/auth/logout':
     *   post:
     *     tags:
     *       - Auth
     *     summary: User logout
     *     operationId: authLogout
     *     responses:
     *       '201':
     *         description: The request has succeeded and the user has logout from system a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessfulResponse'
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.post("/logout", validateJWT("access"), (req, res) =>
      this.logout(req, res),
    );
    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     tags:
     *       - Auth
     *     summary: User refresh token
     *     operationId: authRefresh
     *     responses:
     *       '201':
     *         description: The request has succeeded and the user has logout refresh token as a result.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessfulResponse'
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.post("/refresh", validateJWT("refresh"), (req, res) =>
      this.refreshToken(req, res),
    );
    /**
     * @swagger
     * /auth/exchange:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Exchange temporal token for access token
     *     operationId: authExchange
     *     responses:
     *       '201':
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
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.post("/exchange", validateJWT("exchange"), (req, res) =>
      this.exchangeToken(req, res),
    );

    return this.router;
  }

  async handleValidToken(req: Request, res: Response) {
    try {
      return Controller.ok(res);
    } catch (err) {
      return Controller.serverError(res, err);
    }
  }

  async logout(req: Request, res: Response) {
    const token: string = req.session.jwtstring;
    const decodedjwt: JWTPayload = req.session.jwt;
    if (_.isUndefined(token)) return Controller.unauthorized(res);
    if (_.isUndefined(decodedjwt)) return Controller.unauthorized(res);
    // Put token in blacklist
    try {
      await JWTBlacklist.create({
        token: token,
        expires: new Date(decodedjwt.exp * 1000),
      });
      return Controller.ok(res);
    } catch (err) {
      return Controller.serverError(res, err);
    }
  }

  async refreshToken(req: Request, res: Response) {
    // Refresh token has been previously authenticated in validateJwt as refresh token
    const refreshToken: string = req.session.jwtstring;
    const decodedjwt: JWTPayload = req.session.jwt;
    const reqUser: Pick<User, "id" | "email"> = req.session.user;
    // Put refresh token in blacklist
    try {
      await JWTBlacklist.create({
        token: refreshToken,
        expires: new Date(decodedjwt.exp * 1000),
      });
      const user = await User.findOne({
        where: { id: reqUser.id },
        include: [{ model: Role, as: "roles" }],
      });
      if (!user || !user.isActive) {
        return Controller.unauthorized(res);
      }
      // Create new token and refresh token and send
      const credentials = authService.getCredentials(user);
      return Controller.ok(res, credentials);
    } catch (err) {
      return Controller.serverError(res, err);
    }
  }

  async exchangeToken(req: Request, res: Response) {
    // Exchange token has been previously authenticated in validateJwt as exchange token
    const reqUser: Pick<User, "id" | "email"> = req.session.user;
    try {
      const user = await User.findOne({
        where: { id: reqUser.id },
        include: [{ model: Role, as: "roles" }],
      });
      if (!user || !user.isActive) {
        return Controller.unauthorized(res);
      }
      // Create new token and refresh token and send
      const credentials = authService.getCredentials(user);
      return Controller.ok(res, credentials);
    } catch (err) {
      return Controller.serverError(res, err);
    }
  }
}

const controller = new AuthController();
export default controller;
