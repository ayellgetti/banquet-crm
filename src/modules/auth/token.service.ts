import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Env } from '../../config/env.js';
import { parseDuration } from '../../utils/duration.js';
import type { AccessTokenPayload } from './auth.types.js';

export class TokenService {
  constructor(private readonly env: Env) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.env.JWT_SECRET, {
      expiresIn: this.env.ACCESS_TOKEN_EXPIRES as jwt.SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, this.env.JWT_SECRET);

    if (typeof decoded !== 'object' || decoded === null) {
      throw new Error('Invalid token payload');
    }

    const { id, username, role } = decoded as AccessTokenPayload;

    if (!id || !username || !role) {
      throw new Error('Invalid token payload');
    }

    return { id, username, role };
  }

  generateRefreshToken(): string {
    return randomBytes(64).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  getRefreshTokenExpiresAt(): Date {
    const durationMs = parseDuration(this.env.REFRESH_TOKEN_EXPIRES);
    return new Date(Date.now() + durationMs);
  }
}
