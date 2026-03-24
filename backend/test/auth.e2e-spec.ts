import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GoogleOAuthClient } from '../src/modules/auth/infrastructure/google-oauth.client';
import { PrismaService } from '../src/common/prisma/prisma.service';

const MOCK_GOOGLE_USER = {
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/photo.jpg',
  providerId: 'google-123456',
};

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const mockGoogleOAuthClient = {
    verifyIdToken: jest.fn().mockResolvedValue(MOCK_GOOGLE_USER),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleOAuthClient)
      .useValue(mockGoogleOAuthClient)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    // 테스트 데이터 정리 (역순 삭제)
    await prisma.refreshToken.deleteMany();
    await prisma.providerAccount.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  beforeEach(() => {
    mockGoogleOAuthClient.verifyIdToken.mockResolvedValue(MOCK_GOOGLE_USER);
  });

  describe('POST /auth/google - Google 로그인', () => {
    it('신규 유저: 회원가입 후 토큰 발급', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'fake-google-id-token' })
        .expect(201);

      expect(res.body.data).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: expect.any(String),
          email: MOCK_GOOGLE_USER.email,
          name: MOCK_GOOGLE_USER.name,
          picture: MOCK_GOOGLE_USER.picture,
        },
      });
    });

    it('기존 유저: 로그인 후 동일 유저로 토큰 발급', async () => {
      const first = await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'fake-google-id-token' })
        .expect(201);

      const second = await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'fake-google-id-token' })
        .expect(201);

      // 같은 유저
      expect(second.body.data.user.id).toBe(first.body.data.user.id);
      // 새 refresh token 발급
      expect(second.body.data.refreshToken).not.toBe(
        first.body.data.refreshToken,
      );
    });

    it('idToken 누락 시 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/google')
        .send({})
        .expect(400);
    });

    it('Google 인증 실패 시 401', async () => {
      mockGoogleOAuthClient.verifyIdToken.mockRejectedValueOnce(
        new UnauthorizedException('Failed to verify Google ID token'),
      );

      await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('POST /auth/refresh - 토큰 갱신', () => {
    let refreshToken: string;

    beforeEach(async () => {
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
        user: {
          email: MOCK_GOOGLE_USER.email,
        },
      });
      // 새로운 refresh token 발급
      expect(res.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('이미 사용된 refresh token으로 재요청 시 401', async () => {
      // 첫 번째 refresh 성공
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // 같은 토큰으로 재시도 → revoked 상태이므로 실패
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

  describe('GET /auth/me - 프로필 조회', () => {
    let accessToken: string;

    beforeEach(async () => {
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

  describe('POST /auth/logout - 로그아웃', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'fake-google-id-token' })
        .expect(201);
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('로그아웃 후 refresh token 무효화', async () => {
      // 로그아웃
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      // 로그아웃된 refresh token으로 갱신 시도 → 실패
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

  describe('전체 흐름: 회원가입 → 프로필 → 토큰 갱신 → 로그아웃', () => {
    it('정상 시나리오 전체 통과', async () => {
      // 1. Google 로그인 (회원가입)
      const loginRes = await request(app.getHttpServer())
        .post('/auth/google')
        .send({ idToken: 'fake-google-id-token' })
        .expect(201);

      const { accessToken, refreshToken, user } = loginRes.body.data;
      expect(user.email).toBe(MOCK_GOOGLE_USER.email);

      // 2. 프로필 조회
      const profileRes = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileRes.body.data.id).toBe(user.id);

      // 3. 토큰 갱신
      const refreshRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const newAccessToken = refreshRes.body.data.accessToken;
      const newRefreshToken = refreshRes.body.data.refreshToken;

      // 4. 새 access token으로 프로필 조회
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // 5. 로그아웃
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .send({ refreshToken: newRefreshToken })
        .expect(200);

      // 6. 로그아웃 후 refresh 불가
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: newRefreshToken })
        .expect(401);
    });
  });
});
