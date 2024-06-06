import { User } from "@/db/models/User/model/User";
import { Controller, handleServerError } from "@/libraries/Controller";
import {
  ModelController,
  parseAttributes,
  parseInclude,
  parseWhere,
} from "@/libraries/ModelController";
import { validateBody } from "@/libraries/Validator";
import { hasCustomPermission } from "@/policies/Authorization";
import {
  verifyAdminPermission,
  isSelfUser,
  validateJWT,
} from "@/policies/General";

import { UserSchema } from "../../validators/User";
import { Request, Response, Router } from "express";

export class UserController extends ModelController<User> {
  email: any;
  id: any;
  constructor() {
    super();
    this.name = "user";
    this.model = User;
  }

  routes(): Router {
    /**
     * @swagger
     * tags:
     *   - name: User
     *     description: User
     */

    /**
     * @swagger
     * components:
     *   schemas:
     *     NewUser:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *           format: email
     *           maxLength: 50
     *           example: john.doe@examples.com
     *         firstname:
     *           type: string
     *           maxLength: 255
     *           example: John
     *         lastname:
     *           type: string
     *           maxLength: 255
     *           example: Mclauren
     *         uidazure:
     *           type: string
     *           format: password
     *           example: 16dded65sd
     *         role:
     *           type: string
     *           enum: ['user', 'admin']
     *
     *     User:
     *       allOf:
     *         - $ref: '#/components/schemas/dbProperties'
     *         - $ref: '#/components/schemas/NewUser'
     */

    /**
     * @swagger
     * components:
     *   requestBodies:
     *     NewUser:
     *       required: true
     *       description: User data
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/NewUser'
     */

    /**
     * @swagger
     * '/user/self':
     *   get:
     *     tags:
     *       - User
     *     summary: Get information of logged in user
     *     description: Return self user
     *     operationId: FindOwnUser
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/include'
     *     responses:
     *       '200':
     *         description: The request has succeeded.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessfulResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/User'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.get(
      "/self",
      validateJWT("access"),
      hasCustomPermission("self-users"),
      (req, res) => this.handleFindSelf(req, res),
    );

    /**
     * @swagger
     * '/user/getall':
     *   get:
     *     tags:
     *       - User
     *     summary: Get all the existing users
     *     operationId: GetAllUsers
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/id'
     *       - $ref: '#/components/parameters/include'
     *       - $ref: '#/components/parameters/attributes'
     *     responses:
     *       '200':
     *         description: The request has succeeded.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessfulResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/User'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.get(
      "/getall",
      validateJWT("access"),
      //AuthMiddleware(),
      //verifyAdminPermission(),
      (req, res) => this.handleFindAll(req, res),
    );

    /**
     * @swagger
     * '/user/{id}':
     *   get:
     *     tags:
     *       - User
     *     summary: Get a user entry by id
     *     operationId: FindUserById
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/id'
     *       - $ref: '#/components/parameters/include'
     *       - $ref: '#/components/parameters/attributes'
     *     responses:
     *       '200':
     *         description: The request has succeeded.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessfulResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/User'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.get(
      "/:id",
      validateJWT("access"),
      //AuthMiddleware(),
      //isSelfUser(),
      (req, res) => this.handleFindOne(req, res),
    );

    this.router.post(
      "/",
      validateJWT("access"),
      validateBody(UserSchema),
      (req, res) => this.handleCreate(req, res),
    );

    /**
     * @swagger
     * '/user/{id}':
     *   put:
     *     tags:
     *       - User
     *     summary: Edit a user entry by id
     *     operationId: EditUserById
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/id'
     *     responses:
     *       '200':
     *         description: The request has succeeded.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessfulResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/User'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/NewUser'
     */
    this.router.put(
      "/:id",
      validateJWT("access"),
      //AuthMiddleware(),
      validateBody(UserSchema),
      (req, res) => this.handleUpdate(req, res),
    ); // only admin can edit user

    /**
     * @swagger
     * '/user/{id}':
     *   delete:
     *     tags:
     *       - User
     *     summary: Delete a user entry by id
     *     operationId: DeleteUserById
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/id'
     *     responses:
     *       '200':
     *         $ref: '#/components/responses/OK'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *
     */
    this.router.delete(
      "/:id",
      validateJWT("access"),
      //AuthMiddleware(),
      (req, res) => this.handleDelete(req, res),
    ); // only admin can delete user

    return this.router;
  }

  async handleFindSelf(req: Request, res: Response) {
    try {
      // For applying constraints (usefull with policies)
      const where = parseWhere(req);
      const id = req.session.user.id;
      const attributes = parseAttributes(req);
      const include = parseInclude(req, this.model);
      const result = await this.findOne(id, { where, include, attributes });
      return Controller.ok(res, result);
    } catch (err) {
      handleServerError(err, res);
    }
  }
}

const user = new UserController();
export default user;
