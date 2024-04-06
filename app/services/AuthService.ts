/*
  AuthService
    Shared Auth logic

  Business logic:
    Used on Auth controllers for managing JWTs
*/

import { config } from "@/config";
import { JWTBlacklist } from "@/db/models/JWTBlacklist/model/JWTBlacklist";
import { Profile } from "@/db/models/Profile/model/Profile";
import { Role } from "@/db/models/Role/model/Role";
import { User } from "@/db/models/User/model/User";
import { Params } from "@/policies/General";
import jwt from "jsonwebtoken";
import _ from "lodash";
import moment from "moment";
import uuid from "uuid";

export interface Token {
  token: string;
  expires: number;
  expires_in: number;
}

export interface AuthCredentials {
  token: string;
  expires: number;
  refresh_token: Token;
  user: Pick<User, "id" | "name" | "email">;
  profile: Profile;
  roles: Role[];
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
  role: number | Array<Role>;
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
    const rolesIds =
      typeof role === "number" ? [role] : role.map(role => role.id);

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
      config.jwt.secret,
    );

    return {
      token: token,
      expires: expires,
      expires_in: expires_in,
    };
  }

  public getCredentials(user: User): AuthCredentials {
    // Prepare response object
    const token = this.createToken({
      email: user.email,
      uid_azure: user.uid_azure,
      role: user.roles,
      type: "access",
      userId: user.id,
    });
    const refreshToken = this.createToken({
      email: user.email,
      uid_azure: user.uid_azure,
      role: user.roles,
      type: "refresh",
      userId: user.id,
    });
    const credentials = {
      token: token.token,
      expires: token.expires,
      refresh_token: refreshToken,
      user: _.pick(user, ["id", "name", "email"]),
      profile: user.profile,
      roles: user.roles,
    };
    return credentials;
  }

  public getExchangeToken(user: User): string {
    const token = this.createToken({
      email: user.email,
      uid_azure: user.uid_azure,
      role: user.roles,
      type: "exchange",
      userId: user.id,
    });
    return token.token;
  }

  public async validateJWT(token: string, type: string): Promise<JWTPayload> {
    // Decode token
    let decodedjwt: JWTPayload;
    try {
      decodedjwt = jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch (err) {
      throw err;
    }
    const reqTime = Date.now() / 1000;
    // Check if token expired
    if (decodedjwt.exp <= reqTime) {
      throw "Token expired";
    }
    // Check if token is early
    if (!_.isUndefined(decodedjwt.nbf) && reqTime <= decodedjwt.nbf) {
      throw "This token is early.";
    }

    // If audience doesn't match
    if (config.jwt[type].audience !== decodedjwt.aud) {
      throw "This token cannot be accepted for this domain.";
    }

    // If the subject doesn't match
    if (config.jwt[type].subject !== decodedjwt.sub) {
      throw "This token cannot be used for this request.";
    }

    // Check if blacklisted
    try {
      const result = await JWTBlacklist.findOne({ where: { token: token } });
      // if exists in blacklist, reject
      if (result != null) throw "This Token is blacklisted.";
      return decodedjwt;
    } catch (err) {
      throw err;
    }
  }
}

const authService = new AuthService();
export default authService;
