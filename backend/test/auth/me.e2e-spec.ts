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

describe('GET /auth/me', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testApp: AuthTestApp;
  let accessToken: string;

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
  });

  it('유효한 access token으로 프로필 조회', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toMatchObject({
      id: expect.any(String),
      email: MOCK_GOOGLE_USER.email,
      name: MOCK_GOOGLE_USER.name,
      picture: MOCK_GOOGLE_USER.picture,
    });
  });

  it('토큰 없이 요청 시 401', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('잘못된 토큰으로 요청 시 401', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
