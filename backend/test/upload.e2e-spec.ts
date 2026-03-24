import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { StorageService } from '../src/common/storage/storage.service';
import { HttpExceptionFilter } from '../src/common/exception/http-exception.filter';
import { AppException } from '../src/common/exception/app.exception';
import { ErrorCode } from '../src/common/exception/error-code.enum';


const MOCK_UPLOAD_URL = 'https://s3.example.com/presigned-url';

const mockStorageService = {
  getPresignedUploadUrl: jest.fn().mockResolvedValue(MOCK_UPLOAD_URL),
};

describe('Upload (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StorageService)
      .useValue(mockStorageService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const message = errors
            .flatMap((e) => Object.values(e.constraints ?? {}))
            .join(', ');
          return new AppException(
            ErrorCode.INVALID_REQUEST,
            message,
            HttpStatus.BAD_REQUEST,
          );
        },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /upload/presigned-url', () => {
    it('허용된 contentType이면 200과 uploadUrl을 반환한다', async () => {
      const response = await request(app.getHttpServer())
        .post('/upload/presigned-url')
        .send({ userId: 'user-1', fileName: 'video.mp4', contentType: 'video/mp4' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.uploadUrl).toBe(MOCK_UPLOAD_URL);
      expect(response.body.data.key).toMatch(/^logs\/user-1\//);
    });

    it('허용되지 않은 contentType이면 400과 INVALID_FILE_TYPE을 반환한다', async () => {
      const response = await request(app.getHttpServer())
        .post('/upload/presigned-url')
        .send({ userId: 'user-1', fileName: 'image.png', contentType: 'image/png' });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.code).toBe('INVALID_FILE_TYPE');
    });

    it('contentType 필드가 없으면 400과 INVALID_REQUEST를 반환한다', async () => {
      const response = await request(app.getHttpServer())
        .post('/upload/presigned-url')
        .send({ userId: 'user-1', fileName: 'video.mp4' });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.code).toBe('INVALID_REQUEST');
    });
  });
});
