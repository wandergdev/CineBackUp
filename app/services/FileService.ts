import { config } from "@/config";
import { File } from "@/db/models/File/model/File";
import mime from "mime-types";
import { extname } from "path";
import { WhereOptions } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import {
  deleteS3File,
  getPublicUploadUrl,
  getS3FileStream,
  putS3File,
} from "./FileManagerService";

type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

interface GetFileParams {
  id: number;
  where: WhereOptions;
}

export const getFile = async ({
  id,
  where,
}: RequireAtLeastOne<GetFileParams>) => {
  const whereOptions = id ? { id, ...where } : where;
  const file = await File.findOne({ where: whereOptions });
  if (!file) {
    throw new Error("Not Found");
  }

  return file;
};

export const getBase64FileFromS3 = async ({
  id,
  where,
}: RequireAtLeastOne<GetFileParams>) => {
  const whereOptions = id ? { id, ...where } : where;
  const file = await File.findOne({ where: whereOptions });
  if (!file) {
    throw new Error("Not Found");
  }

  const base64File = await getS3FileStream({
    Bucket: config.aws.s3.fileBucketName,
    Key: file.path,
  })
    .then(stream => {
      const chunks = [];
      return new Promise((resolve, reject) => {
        stream.on("data", chunk => {
          chunks.push(chunk);
        });
        stream.on("error", reject);
        stream.on("finish", () => {
          resolve(Buffer.concat(chunks).toString("base64"));
        });
      });
    })
    .then(chuncks => String(chuncks))
    .catch(() => null);

  return base64File;
};

interface UploadFileParams {
  fileContent: string | Buffer;
  fileName: string;
  type: string;
}

export const createAndUploadFile = async ({
  fileContent,
  fileName,
  type,
}: UploadFileParams) => {
  const extension = extname(fileName);
  const path = `${type}/${uuidv4()}${extension}`;
  const newFile: File = await File.create({
    type,
    fileName,
    path,
    isUploaded: false,
  });

  const fileBuffer: Buffer =
    typeof fileContent === "string"
      ? Buffer.from(fileContent, "base64")
      : fileContent;

  const params = {
    Bucket: config.aws.s3.fileBucketName,
    Key: path,
    Body: fileBuffer,
    ContentType: type,
    ContentLength: fileBuffer.length,
  };

  const isUploaded = await putS3File(params)
    .then(() => true)
    .catch(() => false);

  await newFile.update({ isUploaded });
  return newFile;
};

export const deleteFileFromS3AndDB = async (id: number) => {
  const file: File = await File.findByPk(id);
  if (!file) {
    return;
  }

  await file.destroy(); // Deletes File from db

  const key = file.path
    .split("/")
    .slice(-2)
    .join("/");

  // Delete from S3
  const params = {
    Bucket: config.aws.s3.fileBucketName,
    Key: key,
  };

  deleteS3File(params);
};

interface UploadURL {
  uploadUrl: string;
}

interface CreateFileParams {
  fileName: string;
  type: string;
}

export const createFileInDB = async ({ fileName, type }: CreateFileParams) => {
  const extension = extname(fileName).toLowerCase();
  const path = `${type}/${uuidv4()}${extension}`;
  const contentType = mime.contentType(fileName) || "application/octet-stream";
  const validExtensions = [".jpeg", ".jpg", ".png"];

  if (!validExtensions.includes(extension)) {
    throw new Error("Invalid extension");
  }

  const created = await File.create({
    type,
    fileName,
    path,
    isUploaded: false,
  });

  const uploadUrl = await getPublicUploadUrl(
    path,
    contentType,
    config.aws.s3.fileBucketName,
  );

  const result: Partial<File> & UploadURL = { ...created.toJSON(), uploadUrl };
  return result;
};
