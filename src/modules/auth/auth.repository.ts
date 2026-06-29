import type { Prisma, PrismaClient } from '@prisma/client';
import type { TokenMeta } from './auth.types.js';

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findUserByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findUserById(id: bigint) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findRefreshTokenByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  createRefreshToken(
    data: {
      userId: bigint;
      tokenHash: string;
      expiresAt: Date;
    } & TokenMeta,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });
  }

  revokeRefreshToken(id: bigint, replacedById: bigint, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        replacedById,
      },
    });
  }

  revokeRefreshTokenById(id: bigint) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllRefreshTokensForUser(userId: bigint) {
    return this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}
