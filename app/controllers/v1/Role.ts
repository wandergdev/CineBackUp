import { Role } from "@/db/models/Role/model/Role";
import { RoleNotFound } from "@/errors/role/RoleNotFound";
import { Controller, handleServerError, parseId } from "@/libraries/Controller";
import {
  ModelController,
  parseAttributes,
  parseInclude,
  parseLimit,
  parseOffset,
  parseOrder,
  parseWhere,
} from "@/libraries/ModelController";
import { AuthMiddleware } from "@/policies/Authorization";
import { validateJWT } from "@/policies/General";
import { getAllRoles, getRoleById } from "@/services/RoleService";
import { Request, Response, Router } from "express";

export class RoleController extends ModelController<Role> {
  constructor() {
    super();
    this.name = "role";
    this.model = Role;
  }

  routes(): Router {
    /**
     * @swagger
     * tags:
     *   - name: Role
     *     description: User roles for profiling
     */

    /**
     * @swagger
     * components:
     *   schemas:
     *     NewRole:
     *       type: object
     *       properties:
     *         name:
     *           type: string
     *           example: Role One
     *         description:
     *           type: string
     *           example: Role for new users
     *         isDefault:
     *           type: boolean
     *           example: true
     *         label:
     *           type: string
     *           default: ""
     *           example: Setting administrator
     *         isPrivate:
     *           type: boolean
     *           default: false
     *           example: false
     *         updatedById:
     *           type: number
     *           format: int64
     *           example: 2
     *
     *     Role:
     *       allOf:
     *         - $ref: '#/components/schemas/dbProperties'
     *         - $ref: '#/components/schemas/NewRole'
     *
     */

    /**
     * @swagger
     * components:
     *   requestBodies:
     *     NewRole:
     *       required: true
     *       description: Role Data
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/NewRole'
     *
     *
     */

    /**
     * @swagger
     *  '/role':
     *    get:
     *      tags:
     *        - Role
     *      summary: Get all role entries
     *      description: |
     *        ## Model relations
     *
     *        This model has relation with / can include the following models:
     *        + UpdatedBy (Employee)
     *      operationId: GetAllRoles
     *      security:
     *        - bearerAuth: []
     *      parameters:
     *        - $ref: '#/components/parameters/limit'
     *        - $ref: '#/components/parameters/offset'
     *        - $ref: '#/components/parameters/order'
     *        - $ref: '#/components/parameters/include'
     *        - $ref: '#/components/parameters/where'
     *        - $ref: '#/components/parameters/attributes'
     *      responses:
     *        '200':
     *          description: The request has succeeded.
     *          content:
     *            application/json:
     *              schema:
     *                allOf:
     *                  - $ref: '#/components/schemas/SuccessfulResponse'
     *                  - type: object
     *                    properties:
     *                      count:
     *                        type: number
     *                        example: 1
     *                      limit:
     *                        type: number
     *                        example: 99
     *                      offset:
     *                        type: number
     *                        example: 0
     *                      data:
     *                        type: array
     *                        items:
     *                          $ref: '#/components/schemas/Role'
     *        '400':
     *          $ref: '#/components/responses/BadRequestError'
     *        '401':
     *          $ref: '#/components/responses/UnauthorizedError'
     *        '403':
     *          $ref: '#/components/responses/ForbiddenError'
     *        '500':
     *          $ref: '#/components/responses/InternalServerError'
     *
     */
    this.router.get("/", validateJWT("access"), AuthMiddleware(), (req, res) =>
      this.handleFindAll(req, res),
    );

    /**
     * @swagger
     * '/role/{id}':
     *   get:
     *     tags:
     *       - Role
     *     summary: Get a role entry by id
     *     operationId: FindRoleById
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
     *                       $ref: '#/components/schemas/Role'
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
      AuthMiddleware(),
      (req, res) => this.handleFindOneRole(req, res),
    );

    return this.router;
  }

  async handleFindAll(req: Request, res: Response) {
    try {
      const where = parseWhere(req);
      const limit = parseLimit(req);
      const offset = parseOffset(req);
      const order = parseOrder(req);
      const attributes = parseAttributes(req);
      const include = parseInclude(req, this.model);
      const result = await getAllRoles({
        where,
        limit,
        offset,
        order,
        include,
        attributes,
      });
      const { data, count } = result;
      return Controller.ok(res, data, { count, limit, offset });
    } catch (err) {
      handleServerError(err, res);
    }
  }

  async handleFindOneRole(req: Request, res: Response) {
    try {
      // For applying constraints (usefull with policies)
      const where = parseWhere(req);
      const id = parseId(req);
      const attributes = parseAttributes(req);
      const include = parseInclude(req, this.model);
      const result = await getRoleById({
        id,
        queryParams: { attributes, include, where },
      });
      return Controller.ok(res, result);
    } catch (err) {
      if (err instanceof RoleNotFound) {
        return Controller.notFound(res, err.message);
      }

      handleServerError(err, res);
    }
  }
}

const role = new RoleController();
export default role;
