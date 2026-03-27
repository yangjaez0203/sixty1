import { createHash, randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { OAuthProvider } from '@prisma/client';
import { AuthService } from './auth.service';
import { UserService } from '../../user/application/user.service';
import { OAuthClient } from '../infrastructure/oauth.client';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/photo.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let oAuthClient: jest.Mocked<OAuthClient>;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: OAuthClient,
          useValue: { verifyIdToken: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { findById: jest.fn(), findOrCreateByProvider: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: RefreshTokenRepository,
          useValue: {
            create: jest.fn(),
            findByTokenHash: jest.fn(),
            revoke: jest.fn(),
            revokeByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    oAuthClient = module.get(OAuthClient);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    refreshTokenRepository = module.get(RefreshTokenRepository);
  });

  describe('login', () => {
    it('Google ID Token을 검증하고 토큰 쌍을 발급한다', async () => {
      oAuthClient.verifyIdToken.mockResolvedValue({
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
        providerId: 'google-123',
      });
      userService.findOrCreateByProvider.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('access-token');
      refreshTokenRepository.create.mockResolvedValue({} as any);

      const result = await service.login('valid-id-token');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('test@example.com');
      expect(oAuthClient.verifyIdToken).toHaveBeenCalledWith(
        'valid-id-token',
      );
      expect(userService.findOrCreateByProvider).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
        provider: OAuthProvider.GOOGLE,
        providerId: 'google-123',
      });
    });
  });

  describe('refresh', () => {
    it('유효한 Refresh Token으로 새 토큰 쌍을 발급한다', async () => {
      const rawToken = randomUUID();
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      refreshTokenRepository.findByTokenHash.mockResolvedValue({
        id: 'rt-1',
        tokenHash,
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: null,
        createdAt: new Date(),
      });
      userService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new-access-token');
      refreshTokenRepository.create.mockResolvedValue({} as any);

      const result = await service.refresh(rawToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('rt-1');
    });

    it('만료된 Refresh Token은 거부한다', async () => {
      const rawToken = randomUUID();
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      refreshTokenRepository.findByTokenHash.mockResolvedValue({
        id: 'rt-1',
        tokenHash,
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: null,
        createdAt: new Date(),
      });

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('폐기된 Refresh Token은 거부한다', async () => {
      const rawToken = randomUUID();
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      refreshTokenRepository.findByTokenHash.mockResolvedValue({
        id: 'rt-1',
        tokenHash,
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: new Date(),
        createdAt: new Date(),
      });

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('존재하지 않는 Refresh Token은 거부한다', async () => {
      refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('Refresh Token을 폐기한다', async () => {
      const rawToken = randomUUID();
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      refreshTokenRepository.findByTokenHash.mockResolvedValue({
        id: 'rt-1',
        tokenHash,
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: null,
        createdAt: new Date(),
      });

      await service.logout(rawToken);

      expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('rt-1');
    });

    it('이미 폐기된 토큰은 무시한다', async () => {
      const rawToken = randomUUID();

      refreshTokenRepository.findByTokenHash.mockResolvedValue({
        id: 'rt-1',
        tokenHash: 'hash',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: new Date(),
        createdAt: new Date(),
      });

      await service.logout(rawToken);

      expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('사용자 프로필을 반환한다', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
      });
    });

    it('존재하지 않는 사용자는 NotFoundException을 던진다', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
