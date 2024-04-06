import core from "express-serve-static-core";
import { Role } from "./db/models/Role/model/Role";
import { User } from "./db/models/User/model/User";
import { JWTPayload } from "./services/AuthService";

declare module "express" {
  interface Request<
    P = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query
  > extends core.Request<P, ResBody, ReqBody, ReqQuery> {
    session?: {
      jwtstring?: string;
      jwt?: JWTPayload;
      user?: Pick<User, "id" | "email" | "uid_azure">;
      roles?: Role[];
      where?: any;
      include?: any;
      attributes?: any;
    } & { [key: string]: any };
  }
}

declare module "i18n" {
  export function init(request: any, response?: any, next?: Function): void;
}
