import { PipeTransform, Injectable, HttpStatus } from '@nestjs/common';
import { AppException } from '../../../../common/exception/app.exception';
import { ErrorCode } from '../../../../common/exception/error-code.enum';

const ALLOWED_CONTENT_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

@Injectable()
export class ValidateVideoContentTypePipe implements PipeTransform {
  transform(value: string): string {
    if (!ALLOWED_CONTENT_TYPES.includes(value)) {
      throw new AppException(
        ErrorCode.INVALID_FILE_TYPE,
        'Unsupported file type.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
