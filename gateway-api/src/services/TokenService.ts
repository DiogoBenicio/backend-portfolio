import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  sub: string;
  role: string;
}

export class TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = env.jwtSecret;
    this.expiresIn = env.jwtExpiresIn;
  }

  sign(payload: TokenPayload): string {
    const options: SignOptions = { expiresIn: this.expiresIn as SignOptions['expiresIn'] };
    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): TokenPayload & JwtPayload {
    return jwt.verify(token, this.secret) as TokenPayload & JwtPayload;
  }

  refresh(token: string): string {
    const decoded = this.verify(token);
    const { iat, exp, ...payload } = decoded;
    return this.sign(payload as TokenPayload);
  }

  extractFromHeader(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  }
}

export const tokenService = new TokenService();
