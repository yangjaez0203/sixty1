import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppException } from '../exception/app.exception';
import { ErrorCode } from '../exception/error-code.enum';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.getOrThrow<string>('AWS_REGION'),
    });
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });
      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      throw this.toAppException(error, ErrorCode.STORAGE_UPLOAD_FAILED);
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      throw this.toAppException(error, ErrorCode.STORAGE_DELETE_FAILED);
    }
  }

  private toAppException(error: unknown, fallbackCode: ErrorCode): AppException {
    if (error instanceof S3ServiceException) {
      if (error.$metadata.httpStatusCode === 403) {
        return new AppException(
          ErrorCode.STORAGE_ACCESS_DENIED,
          'S3 access denied.',
          HttpStatus.FORBIDDEN,
        );
      }
      return new AppException(
        fallbackCode,
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return new AppException(
      fallbackCode,
      'Unexpected storage error.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
