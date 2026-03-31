import { RefreshToken } from '@prisma/client';

export abstract class RefreshTokenRepository {
  abstract create(
    tokenHash: string,
    userId: string,
    expiresAt: Date,
  ): Promise<RefreshToken>;
  abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  abstract revoke(id: string): Promise<void>;
  abstract revokeByUserId(userId: string): Promise<void>;
}
