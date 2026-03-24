import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { GoogleOAuthClient } from '../../src/modules/auth/infrastructure/google-oauth.client';
import { PrismaService } from '../../src/common/prisma/prisma.service';

export const MOCK_GOOGLE_USER = {
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/photo.jpg',
  providerId: 'google-123456',
};

export interface AuthTestApp {
  app: INestApplication<App>;
  prisma: PrismaService;
  mockGoogleOAuthClient: { verifyIdToken: jest.Mock };
}

export async function createAuthTestApp(): Promise<AuthTestApp> {
  const mockGoogleOAuthClient = {
    verifyIdToken: jest.fn().mockResolvedValue(MOCK_GOOGLE_USER),
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(GoogleOAuthClient)
    .useValue(mockGoogleOAuthClient)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  const prisma = moduleFixture.get(PrismaService);

  return { app, prisma, mockGoogleOAuthClient };
}

export async function cleanupAuthTestDb(prisma: PrismaService): Promise<void> {
  await prisma.refreshToken.deleteMany();
  await prisma.providerAccount.deleteMany();
  await prisma.user.deleteMany();
}
