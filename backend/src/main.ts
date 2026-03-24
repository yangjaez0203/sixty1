import { NestFactory } from '@nestjs/core';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppException } from './common/exception/app.exception';
import { ErrorCode } from './common/exception/error-code.enum';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';

const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
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
  await app.listen(process.env.PORT ?? 3003);
}
void bootstrap();
