import { Role } from "@/db/models/Role/model/Role";
import { RoleNames } from "@/db/models/Role/types/RoleNames.type";
import { Controller, getRoleFromToken } from "@/libraries/Controller";
import authService from "@/services/AuthService";
import { Request, Response } from "express";
import _ from "lodash";

const propertyMapper = {
  createdById: "id",
  updatedById: "id",
};

/*
  Validates a JWT
  puts decoded jwt in req.session.jwt
  puts user object with id, email and role in req.session.user
*/
export interface Params {
  [key: string]: any;
}

interface ValidateToken {
  authorization: string;
  next: Function;
  session: Params;
  type: string;
}

const validateToken = async ({
  authorization,
  next,
  session,
  type,
}: ValidateToken) => {
  try {
    let token: string | null = null;
    if (!authorization) {
      throw "No token present";
    }
    const parts: Array<string> = authorization.split(" ");
    if (parts.length === 2) {
      const scheme: string = parts[0];
      const credentials: string = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    }

    const isValid = await authService
      .validateJWT(token, type)
      .then(decoded => {
        if (!decoded) {
          throw "Invalid Token";
        }
        session.jwt = decoded;
        session.jwtstring = token;
        session.user = _.pick(decoded, ["id", "uid_azure", "email"]);
        next();
        return true;
      })
      .catch(error => {
        throw error;
      });

    return isValid;
  } catch (error) {
    throw error;
  }
};

interface ValidateTypeIsInToken {
  authorization: string;
  next: Function;
  session: Params;
  types: Array<string>;
}

const validateTypeIsInToken = async ({
  authorization,
  next,
  session,
  types,
}: ValidateTypeIsInToken) => {
  try {
    for (const type of types) {
      const isTokenValid = await validateToken({
        authorization,
        next,
        session,
        type,
      }).catch(() => null);
      if (isTokenValid) {
        return null;
      }
    }
    throw "Invalid Token";
  } catch (error) {
    throw error;
  }
};

export function atLeastOneTypeIsInToken(types: Array<string>) {
  return (req: Request, res: Response, next: Function) => {
    const authorization: string = req.get("Authorization");
    validateTypeIsInToken({
      authorization,
      next,
      session: req.session,
      types,
    }).catch(error => {
      Controller.unauthorized(res, error);
    });
  };
}

export function validateJWT(type: string) {
  return (req: Request, res: Response, next: Function) => {
    const authorization: string = req.get("Authorization");
    validateToken({
      authorization,
      next,
      session: req.session,
      type,
    }).catch(error => Controller.unauthorized(res, error));
  };
}

export function validateJWTOnQueryString(type: string, key = "token") {
  return (req: Request, res: Response, next: Function) => {
    const token = req.query[key] as string;
    if (token == null) {
      Controller.unauthorized(res, "No Token Present");
      return null;
    }

    authService
      .validateJWT(token, type)
      .then(decoded => {
        if (!decoded) {
          Controller.unauthorized(res, "Invalid Token");
          return null;
        }
        req.session.jwt = decoded;
        req.session.jwtstring = token;
        req.session.user = _.pick(decoded, ["id", "email", "uid_azure"]);
        next();
        return null;
      })
      .catch(err => {
        Controller.unauthorized(res, err);
      });
  };
}

/*
  Enforces access only to owner
    key: key to compare user id
*/
export function filterOwner(key = "userId") {
  return (req: Request, res: Response, next: Function) => {
    const id = req.session.jwt.id;
    if (id == null) return Controller.unauthorized(res);
    if (req.session.where == null) req.session.where = {};
    req.session.where[key] = id;
    next();
  };
}

export function isOwner(model: any, key = "userId") {
  return (req: Request, res: Response, next: Function) => {
    const userId = req.session.jwt.id;
    if (userId == null) return Controller.unauthorized(res);
    const id: number = parseInt(req.params.id);
    if (id == null)
      return Controller.badRequest(res, "Bad Request: No id in request.");
    model
      .findByPk(id)
      .then((result: any) => {
        if (!result) return Controller.notFound(res);
        if (result[key] !== userId) return Controller.forbidden(res);
        req.session.instance = result;
        next();
      })
      .catch(() => {
        Controller.serverError(res);
      });
  };
}

/*
  Appends userId to body (useful for enforcing ownership when creating items)
    key: key to add/modify on body
*/
export function appendUser(key = "userId") {
  return (req: Request, res: Response, next: Function) => {
    const id = req.session.jwt.id;
    if (id == null) return Controller.unauthorized(res);
    if (!req.body) req.body = {};
    req.body[key] = id;
    next();
  };
}

export function appendEmployee(key = "uid_azure") {
  return (req: Request, res: Response, next: Function) => {
    const id = req.session.jwt.uid_azure;
    if (id == null) return Controller.unauthorized(res);
    if (!req.body) req.body = {};
    req.body[key] = id;
    next();
  };
}

export function appendMiddleware(...properties: string[]) {
  return (req: Request, res: Response, next: Function) => {
    properties.forEach(property => {
      req.body[property] = req.session.jwt[propertyMapper[property]];
    });
    next();
  };
}

/*
  Strips nested objects, substituting with their id (if any)
*/
export function stripNestedObjects() {
  return (req: Request, res: Response, next: Function) => {
    if (!req.body) req.body = {};
    // Iterate through all keys in the body
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        // Validate if not from prototype
        if (
          Object.prototype.toString.call(req.body[key]) === "[object Object]"
        ) {
          // Append id and delete original
          if (req.body[key].id !== undefined)
            req.body[`${key}Id`] = req.body[key].id;
          delete req.body[key];
        }
      }
    }
    next();
  };
}

/*
  Checks if the requested user is self
  ** Only applicable to UserController
*/
export function isSelfUser() {
  return (req: Request, res: Response, next: Function) => {
    const id = req.session.jwt.id;
    if (id == null) return Controller.unauthorized(res);
    if (id !== parseInt(req.params.id)) return Controller.unauthorized(res);
    next();
  };
}

/*
  Checks if the requested user is not self
  ** Only applicable to UserController
*/
export function isNotSelfUser() {
  return (req: Request, res: Response, next: Function) => {
    const id = req.session.jwt.id;
    if (id == null) return Controller.unauthorized(res);
    if (id === parseInt(req.params.id)) return Controller.unauthorized(res);
    next();
  };
}

export function verifyAdminPermission() {
  return async (req: Request, res: Response, next: Function) => {
    if (req["canModify"]) {
      next();
    } else {
      const roles = getRoleFromToken(req);
      const [adminRole] = await Role.findAll({
        where: {
          name: RoleNames.ADMIN,
        },
      });

      const hasRole = roles.find(role => role === adminRole.id);

      req["canModify"] = !!hasRole;
      next();
    }
  };
}

function ommitNullsValuesFromObj(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Validate if not from prototype
      if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
        ommitNullsValuesFromObj(obj[key]);
      } else if (Array.isArray(obj[key])) {
        for (let index = 0; index < obj[key].length; index++) {
          ommitNullsValuesFromObj(obj[key][index]);
        }
      } else {
        if (obj[key] === null) {
          delete obj[key];
        }
      }
    }
  }
}

export function stripBodyNulls() {
  return (req: Request, res: Response, next: Function) => {
    if (!req.body) req.body = {};
    ommitNullsValuesFromObj(req.body);
    next();
  };
}

export function validateAudience() {
  return (req: Request, res: Response, next: Function) => {
    const { userId, groupId } = req.body;
    if (!(userId || groupId)) {
      res.status(400).send({
        message: "The group or user id is required",
      });
    }
    next();
  };
}
