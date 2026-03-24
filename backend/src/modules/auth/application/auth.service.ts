import { createHash, randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuthProvider, User } from '@prisma/client';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';
import { UserService } from '../../user/application/user.service';
import {
  AuthTokensResponseDto,
  UserProfileResponseDto,
} from '../presentation/dto/auth-tokens.response.dto';
import { OAuthClient } from '../infrastructure/oauth.client';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly oAuthClient: OAuthClient,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async login(idToken: string): Promise<AuthTokensResponseDto> {
    const googleUser = await this.oAuthClient.verifyIdToken(idToken);

    const user = await this.userService.findOrCreateByProvider({
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      provider: OAuthProvider.GOOGLE,
      providerId: googleUser.providerId,
    });

    return this.issueTokens(user);
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokensResponseDto> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.refreshTokenRepository.revoke(storedToken.id);

    const user = await this.userService.findById(storedToken.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.issueTokens(user);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await this.refreshTokenRepository.revoke(storedToken.id);
    }
  }

  private async issueTokens(user: User): Promise<AuthTokensResponseDto> {
    const payload: JwtPayload = { userId: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.parseExpiration(
        process.env.JWT_ACCESS_EXPIRATION ?? '15m',
      ),
    });

    const rawRefreshToken = randomUUID();
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = this.calculateRefreshExpiration();

    await this.refreshTokenRepository.create(tokenHash, user.id, expiresAt);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: this.toUserProfile(user),
    };
  }

  private toUserProfile(user: User): UserProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // 15m fallback

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return value * multipliers[unit];
  }

  private calculateRefreshExpiration(): Date {
    const expiration = process.env.JWT_REFRESH_EXPIRATION ?? '7d';
    return new Date(Date.now() + this.parseExpiration(expiration) * 1000);
  }
}
