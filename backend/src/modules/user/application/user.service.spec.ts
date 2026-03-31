import { OAuthProvider } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../infrastructure/user.repository';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/photo.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<UserRepository> = {
      findById: jest.fn(),
      findByProviderAndProviderId: jest.fn(),
      createWithProvider: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(UserRepository);
  });

  describe('findById', () => {
    it('사용자를 ID로 조회한다', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(repository.findById).toHaveBeenCalledWith('user-1');
    });

    it('존재하지 않는 사용자는 null을 반환한다', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('사용자 프로필을 반환한다', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 사용자는 NotFoundException을 던진다', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOrCreateByProvider', () => {
    const params = {
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/photo.jpg',
      provider: OAuthProvider.GOOGLE,
      providerId: 'google-123',
    };

    it('기존 사용자가 있으면 반환한다', async () => {
      repository.findByProviderAndProviderId.mockResolvedValue(mockUser);

      const result = await service.findOrCreateByProvider(params);

      expect(result).toEqual(mockUser);
      expect(repository.createWithProvider).not.toHaveBeenCalled();
    });

    it('기존 사용자가 없으면 새로 생성한다', async () => {
      repository.findByProviderAndProviderId.mockResolvedValue(null);
      repository.createWithProvider.mockResolvedValue(mockUser);

      const result = await service.findOrCreateByProvider(params);

      expect(result).toEqual(mockUser);
      expect(repository.createWithProvider).toHaveBeenCalledWith(params);
    });
  });
});
