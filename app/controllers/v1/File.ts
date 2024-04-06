import { File } from "@/db/models/File/model/File";
import {
  Controller,
  handleServerError,
  parseBody,
  parseId,
} from "@/libraries/Controller";
import { ModelController } from "@/libraries/ModelController";
import { validateBody } from "@/libraries/Validator";
import { AuthMiddleware } from "@/policies/Authorization";
import { validateJWT } from "@/policies/General";
import { createFileInDB, deleteFileFromS3AndDB } from "@/services/FileService";
import { FileSchema } from "@/validators/File";
import { Request, Response, Router } from "express";

export class FileController extends ModelController<File> {
  constructor() {
    super();
    this.name = "file";
    this.model = File;
  }

  routes(): Router {
    /**
     * @swagger
     * tags:
     *   - name: File
     *     description: Uploaded file information and Upload endpoint
     */

    /**
     * @swagger
     * components:
     *   requestBodies:
     *     NewFile:
     *       required: true
     *       description: File data
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/NewFile'
     */

    /**
     * @swagger
     * components:
     *   schemas:
     *     NewFile:
     *       type: object
     *       properties:
     *         type:
     *           type: string
     *           minLength: 1
     *           maxLength: 255
     *           example: image
     *         fileName:
     *           type: string
     *           minLength: 1
     *           maxLength: 255
     *           example: image.png
     */

    /**
     * @swagger
     * '/file':
     *   get:
     *     tags:
     *       - File
     *     summary: Get all file entries
     *     operationId: GetAllFiles
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
     *                         $ref: '#/components/schemas/NewFile'
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
     * '/file/{id}':
     *   get:
     *     tags:
     *       - File
     *     summary: Get a file entry by id
     *     operationId: FindFileById
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
     *                       $ref: '#/components/schemas/NewFile'
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
     * '/file':
     *   post:
     *     tags:
     *       - File
     *     summary: Prepare a file for upload
     *     description: |
     *       File upload is a 2 step process:
     *       1. Post here to create the db representation of the file, you will get the upload url in the response.
     *       2. Upload the file to that url (uploadUrl).
     *     operationId: CreateFile
     *     security:
     *       - bearerAuth: []
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
     *                       $ref: '#/components/schemas/NewFile'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/NewFile'
     */
    /*
      File upload is a 2 step process:
      1. Post here to create the db representation of the file, you will get the upload url in the response
      2. Upload the file to that url
    */
    this.router.post(
      "/",
      validateJWT("access"),
      AuthMiddleware(),
      validateBody(FileSchema),
      (req, res) => this.handleCreate(req, res),
    );

    /**
     * @swagger
     * '/file/{id}':
     *   put:
     *     tags:
     *       - File
     *     summary: Edit a file entry by id
     *     operationId: EditFileById
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
     *                       $ref: '#/components/schemas/NewFile'
     *       '401':
     *         $ref: '#/components/responses/UnauthorizedError'
     *       '403':
     *         $ref: '#/components/responses/ForbiddenError'
     *       '404':
     *         $ref: '#/components/responses/NotFoundError'
     *       '500':
     *         $ref: '#/components/responses/InternalServerError'
     *     requestBody:
     *       $ref: '#/components/requestBodies/NewFile'
     */
    this.router.put(
      "/:id",
      validateJWT("access"),
      AuthMiddleware(),
      validateBody(FileSchema),
      (req, res) => this.handleUpdate(req, res),
    );

    /**
     * @swagger
     * '/file/{id}':
     *   delete:
     *     tags:
     *       - File
     *     summary: Delete a file entry by id
     *     operationId: DeleteFileById
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
      AuthMiddleware(),
      (req, res) => this.deleteFile(req, res),
    );

    return this.router;
  }

  private async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      await deleteFileFromS3AndDB(parseId(req));
      return Controller.noContent(res);
    } catch (error) {
      handleServerError(error, res);
    }
  }

  async handleCreate(req: Request, res: Response) {
    try {
      const values = parseBody(req);
      const { fileName, type } = values;
      const result = await createFileInDB({ fileName, type });
      return Controller.created(res, result);
    } catch (err) {
      handleServerError(err, res);
    }
  }
}

const file = new FileController();
export default file;
