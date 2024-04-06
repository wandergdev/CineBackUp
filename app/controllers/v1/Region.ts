import { Region } from "@/db/models/Region/model/Region";
import { ModelController } from "@/libraries/ModelController";
import { validateBody } from "@/libraries/Validator";
import { AuthMiddleware } from "@/policies/Authorization";
import { stripNestedObjects, validateJWT } from "@/policies/General";
import { CreateRegionSchema, UpdateRegionSchema } from "@/validators/Region";
import { Router } from "express";

export class RegionController extends ModelController<Region> {
  constructor() {
    super();
    this.name = "region";
    this.model = Region;
  }

  routes(): Router {
    /**
     * @swagger
     * tags:
     *   - name: Region
     *     description: Regions that are available on Ksquare
     */

    /**
     * @swagger
     * components:
     *   schemas:
     *     NewRegion:
     *       type: object
     *       required:
     *         - name
     *         - currencyId
     *       properties:
     *         name:
     *           type: string
     *           maxLength: 255
     *           example: United States
     *         regionCodeAlphaThree:
     *           type: string
     *           example: USA
     *
     *     EditRegion:
     *       type: object
     *       properties:
     *         name:
     *           type: string
     *           maxLength: 255
     *           example: United States
     *         regionCodeAlphaThree:
     *           type: string
     *           example: USA
     *
     *     Region:
     *       allOf:
     *         - $ref: '#/components/schemas/dbProperties'
     *         - $ref: '#/components/schemas/NewRegion'
     */

    /**
     * @swagger
     * components:
     *   requestBodies:
     *     NewRegion:
     *       required: true
     *       description: Examples related with the creation of an entry for this specific endpoint.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/NewRegion'
     *           examples:
     *             basicRegion:
     *               summary: Create a basic region entry
     *               description: Create a basic region entry using only the required model fields.
     *               value:
     *                 name: Mexico
     *                 currencyId: 1
     *             completeRegion:
     *               summary: Create a complete region entry
     *               description: |
     *                 Create a complete region entry using all the available model fields.
     *               value:
     *                 name: Mexico
     *                 currencyId: 1
     *                 codeAlphaThree: MEX
     *
     *     EditRegion:
     *       required: false
     *       description: Examples related with the modification of an entry for this specific endpoint.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EditRegion'
     *           examples:
     *             nameRegion:
     *               summary: Change region name
     *               value:
     *                 name: India
     */

    /**
     * @swagger
     * '/region':
     *   get:
     *     tags:
     *       - Region
     *     summary: Get all region entries
     *     description: |
     *       ## Model relations
     *
     *       This model has relation with / can include the following models:
     *       + Currency
     *       + Employee
     *     operationId: GetAllRegions
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - $ref: '#/components/parameters/limit'
     *       - $ref: '#/components/parameters/offset'
     *       - $ref: '#/components/parameters/order'
     *       - $ref: '#/components/parameters/include'
     *       - $ref: '#/components/parameters/where'
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
     *                     count:
     *                       type: number
     *                       example: 1
     *                     limit:
     *                       type: number
     *                       example: 99
     *                     offset:
     *                       type: number
     *                       example: 0
     *                     data:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/Region'
     *       '400':
     *         $ref: '#/components/responses/BadRequestError'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     */
    this.router.get("/", validateJWT("access"), AuthMiddleware(), (req, res) =>
      this.handleFindAll(req, res),
    );

    /**
     * @swagger
     * '/region/{id}':
     *   get:
     *     tags:
     *       - Region
     *     summary: Get a region entry by id
     *     description: |
     *       ## Model relations
     *
     *       This model has relation with / can include the following models:
     *       + Currency
     *       + Employee
     *     operationId: FindRegionById
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
     *                       $ref: '#/components/schemas/Region'
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
      (req, res) => this.handleFindOne(req, res),
    );

    /**
     * @swagger
     * '/region':
     *   post:
     *     tags:
     *       - Region
     *     summary: Create a region entry
     *     operationId: CreateRegion
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '201':
     *         description: The request has succeeded.
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/CreatedResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/Region'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/NewRegion'
     */
    this.router.post(
      "/",
      validateJWT("access"),
      AuthMiddleware(),
      validateBody(CreateRegionSchema),
      stripNestedObjects(),
      (req, res) => this.handleCreate(req, res),
    );

    /**
     * @swagger
     * '/region/{id}':
     *   put:
     *     tags:
     *       - Region
     *     summary: Edit a region entry by id
     *     operationId: EditRegionById
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
     *                       $ref: '#/components/schemas/Region'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/EditRegion'
     */
    this.router.put(
      "/:id",
      validateJWT("access"),
      AuthMiddleware(),
      validateBody(UpdateRegionSchema),
      stripNestedObjects(),
      (req, res) => this.handleUpdate(req, res),
    );

    /**
     * @swagger
     * '/region/{id}':
     *   delete:
     *     tags:
     *       - Region
     *     summary: Delete a region entry by id
     *     operationId: DeleteRegionById
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
     */
    this.router.delete(
      "/:id",
      validateJWT("access"),
      AuthMiddleware(),
      (req, res) => this.handleDelete(req, res),
    );

    return this.router;
  }
}

const region = new RegionController();
export default region;
