import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppException } from './app.exception';
import { ErrorCode } from './error-code.enum';

const HTTP_STATUS_TO_CODE: Partial<Record<HttpStatus, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.INVALID_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.INTERNAL_SERVER_ERROR,
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    if (exception instanceof AppException) {
      const body = exception.getResponse() as {
        code: ErrorCode;
        message: string;
        data?: unknown;
      };
      const payload: Record<string, unknown> = {
        code: body.code,
        message: body.message,
      };
      if (body.data !== undefined) payload.data = body.data;
      response.status(status).json(payload);
      return;
    }

    const code =
      HTTP_STATUS_TO_CODE[status as HttpStatus] ??
      ErrorCode.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (((exceptionResponse as Record<string, unknown>).message as string) ??
          exception.message);

    response.status(status).json({ code, message });
  }
}
