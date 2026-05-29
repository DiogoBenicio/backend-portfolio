import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
  sub: string;
  role: string;
}

export class TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly adminUser: string;

  constructor() {
    this.secret = env.jwtSecret;
    this.expiresIn = env.jwtExpiresIn;
    this.adminUser = env.adminUser;
    if (!/^\d+[smhd]$/.test(this.expiresIn)) {
      throw new Error(`JWT_EXPIRES_IN inválido: "${this.expiresIn}"`);
    }
  }

  sign(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): TokenPayload & JwtPayload {
    return jwt.verify(token, this.secret, {
      algorithms: ["HS256"],
    }) as TokenPayload & JwtPayload;
  }

  refresh(token: string): string {
    const decoded = jwt.verify(token, this.secret, {
      algorithms: ["HS256"],
      ignoreExpiration: true,
    }) as TokenPayload & JwtPayload;
    if (decoded.sub !== this.adminUser) {
      throw Object.assign(new Error("Token inválido"), { statusCode: 401 });
    }
    const { iat: _iat, exp: _exp, ...payload } = decoded;
    return this.sign(payload as TokenPayload);
  }

  extractFromHeader(authHeader?: string): string | null {
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
  }
}

export const tokenService = new TokenService();
