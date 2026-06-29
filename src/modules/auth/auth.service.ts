import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../../shared/errors/app-error.js';
import { normalizeMobile } from '../../utils/mobile.js';
import { toUserProfile } from './auth.mapper.js';
import { AuthRepository } from './auth.repository.js';
import type { LoginInput, LogoutInput, RefreshInput } from './auth.schema.js';
import type { AuthTokens, LoginResult, TokenMeta } from './auth.types.js';
import { TokenService } from './token.service.js';

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaClient,
  ) {}

  async login(input: LoginInput, meta: TokenMeta): Promise<LoginResult> {
    const username = normalizeMobile(input.username);

    if (!username) {
      throw new AppError('Invalid username or password', 401);
    }

    const user = await this.repository.findUserByUsername(username);

    if (!user) {
      throw new AppError('Invalid username or password', 401);
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordValid) {
      throw new AppError('Invalid username or password', 401);
    }

    const tokens = await this.issueTokens(user.id, user.username, user.role, meta);

    return {
      ...tokens,
      user: toUserProfile(user),
    };
  }

  async refresh(input: RefreshInput, meta: TokenMeta): Promise<AuthTokens> {
    const tokenHash = this.tokenService.hashRefreshToken(input.refreshToken);
    const existing = await this.repository.findRefreshTokenByHash(tokenHash);

    if (!existing) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (existing.revokedAt) {
      await this.repository.revokeAllRefreshTokensForUser(existing.userId);
      throw new AppError('Invalid refresh token', 401);
    }

    if (existing.expiresAt <= new Date()) {
      throw new AppError('Refresh token expired', 401);
    }

    const user = await this.repository.findUserById(existing.userId);

    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newTokenHash = this.tokenService.hashRefreshToken(newRefreshToken);
    const expiresAt = this.tokenService.getRefreshTokenExpiresAt();

    await this.prisma.$transaction(async (tx) => {
      const newRecord = await this.repository.createRefreshToken(
        {
          userId: existing.userId,
          tokenHash: newTokenHash,
          expiresAt,
          userAgent: meta.userAgent,
          ipAddress: meta.ipAddress,
        },
        tx,
      );

      await this.repository.revokeRefreshToken(existing.id, newRecord.id, tx);
    });

    const accessToken = this.tokenService.signAccessToken({
      id: user.id.toString(),
      username: user.username,
      role: user.role,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(input: LogoutInput): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashRefreshToken(input.refreshToken);
    const existing = await this.repository.findRefreshTokenByHash(tokenHash);

    if (!existing || existing.revokedAt) {
      return { message: 'Logged out' };
    }

    await this.repository.revokeRefreshTokenById(existing.id);

    return { message: 'Logged out' };
  }

  private async issueTokens(
    userId: bigint,
    username: string,
    role: Parameters<TokenService['signAccessToken']>[0]['role'],
    meta: TokenMeta,
  ): Promise<AuthTokens> {
    const refreshToken = this.tokenService.generateRefreshToken();
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const expiresAt = this.tokenService.getRefreshTokenExpiresAt();

    await this.repository.createRefreshToken({
      userId,
      tokenHash,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    const accessToken = this.tokenService.signAccessToken({
      id: userId.toString(),
      username,
      role,
    });

    return { accessToken, refreshToken };
  }
}
