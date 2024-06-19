import { config } from "@/config";
import { JWTBlacklist } from "@/db/models/JWTBlacklist/model/JWTBlacklist";
import jwt from "jsonwebtoken";
import _ from "lodash";
import moment from "moment";
import uuid from "uuid";
import { Params } from "@/policies/General";

const jwtSecret = config.jwt.secret;

export interface Token {
  token: string;
  expires: number;
  expires_in: number;
}

export interface AuthCredentials {
  token: string;
  expires: number;
  refresh_token: Token;
  user: { id: number; name: string; email: string };
  profile: any;
  roles: any[];
}

export interface JWTPayload {
  customParams?: Params;
  id: number;
  uid_azure: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nbf?: number;
  jti: string;
  email: string;
  roles: string[];
}

interface TokenCreation {
  customParams?: Params;
  email: string;
  uid_azure?: string;
  role: number | Array<any>;
  type: string;
  userId?: number;
}

class AuthService {
  public createToken({
    customParams,
    email,
    uid_azure,
    role,
    type,
    userId,
  }: TokenCreation): Token {
    const expiryUnit: moment.unitOfTime.DurationConstructor =
      config.jwt[type].expiry.unit;
    const expiryLength: number = config.jwt[type].expiry.length;
    const rolesIds = Array.isArray(role) ? role.map((r: any) => r.id) : [role];

    const expires =
      moment()
        .add(expiryLength, expiryUnit)
        .valueOf() / 1000;
    const issued = Date.now() / 1000;
    const expires_in = expires - issued; // seconds

    const token = jwt.sign(
      {
        id: userId,
        uid_azure,
        sub: config.jwt[type].subject,
        aud: config.jwt[type].audience,
        exp: expires,
        iat: issued,
        jti: uuid.v4(),
        email,
        roles: rolesIds,
        customParams,
      },
      jwtSecret,
    );

    return {
      token,
      expires,
      expires_in,
    };
  }

  public getCredentials(user: any): AuthCredentials {
    const roles = user.roles ? user.roles.map((role: any) => role.name) : []; // Asegúrate de incluir los nombres de los roles y manejar el caso de roles nulos
    const token = this.createToken({
      email: user.email,
      uid_azure: user.uid_azure,
      role: roles,
      type: "access",
      userId: user.id,
    });
    const refreshToken = this.createToken({
      email: user.email,
      uid_azure: user.uid_azure,
      role: roles,
      type: "refresh",
      userId: user.id,
    });
    return {
      token: token.token,
      expires: token.expires,
      refresh_token: refreshToken,
      user: _.pick(user, ["id", "name", "email"]),
      profile: user.profile,
      roles: user.roles || [], // Asegúrate de devolver una lista vacía si no hay roles
    };
  }

  public async validateJWT(token: string, type: string): Promise<JWTPayload> {
    let decodedjwt: JWTPayload;
    try {
      decodedjwt = jwt.verify(token, jwtSecret) as JWTPayload;
      console.log("Decoded JWT:", decodedjwt); // Agrega esto para verificar el JWT
    } catch (err) {
      console.error("JWT verification failed:", err); // Agrega este log
      throw new Error("Invalid token");
    }

    const reqTime = Date.now() / 1000;
    if (decodedjwt.exp <= reqTime) {
      console.error("JWT token expired:", decodedjwt); // Agrega este log
      throw new Error("Token expired");
    }

    if (!_.isUndefined(decodedjwt.nbf) && reqTime <= decodedjwt.nbf) {
      console.error("JWT token not yet valid:", decodedjwt); // Agrega este log
      throw new Error("This token is early.");
    }

    if (config.jwt[type].audience !== decodedjwt.aud) {
      console.error("JWT audience mismatch:", decodedjwt); // Agrega este log
      throw new Error("This token cannot be accepted for this domain.");
    }

    if (config.jwt[type].subject !== decodedjwt.sub) {
      console.error("JWT subject mismatch:", decodedjwt); // Agrega este log
      throw new Error("This token cannot be used for this request.");
    }

    const result = await JWTBlacklist.findOne({ where: { token } });
    if (result != null) {
      console.error("JWT token is blacklisted:", decodedjwt); // Agrega este log
      throw new Error("This Token is blacklisted.");
    }

    return decodedjwt;
  }
}

const authService = new AuthService();
export default authService;
