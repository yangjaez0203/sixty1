import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import {
  AuthTestApp,
  cleanupAuthTestDb,
  createAuthTestApp,
  MOCK_GOOGLE_USER,
} from '../helpers/auth-app.helper';

describe('POST /auth/logout', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testApp: AuthTestApp;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    testApp = await createAuthTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  afterAll(async () => {
    await cleanupAuthTestDb(prisma);
    await app.close();
  });

  beforeEach(async () => {
    testApp.mockGoogleOAuthClient.verifyIdToken.mockResolvedValue(MOCK_GOOGLE_USER);
    const res = await request(app.getHttpServer())
      .post('/auth/google')
      .send({ idToken: 'fake-google-id-token' })
      .expect(201);
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('로그아웃 후 refresh token 무효화', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('토큰 없이 로그아웃 시 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken })
      .expect(401);
  });
});
