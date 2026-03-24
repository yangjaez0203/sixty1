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

describe('POST /auth/refresh', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testApp: AuthTestApp;
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
    refreshToken = res.body.data.refreshToken;
  });

  it('유효한 refresh token으로 새 토큰 쌍 발급', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.data).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: { email: MOCK_GOOGLE_USER.email },
    });
    expect(res.body.data.refreshToken).not.toBe(refreshToken);
  });

  it('이미 사용된 refresh token으로 재요청 시 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('존재하지 않는 refresh token으로 요청 시 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'non-existent-token' })
      .expect(401);
  });

  it('refreshToken 누락 시 400', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({})
      .expect(400);
  });
});
