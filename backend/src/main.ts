import { NestFactory } from '@nestjs/core';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppException } from './common/exception/app.exception';
import { ErrorCode } from './common/exception/error-code.enum';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        if (firstError?.property === 'contentType') {
          return new AppException(
            ErrorCode.INVALID_FILE_TYPE,
            'Unsupported file type.',
            HttpStatus.BAD_REQUEST,
          );
        }
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
