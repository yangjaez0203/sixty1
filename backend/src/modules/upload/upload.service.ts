import { Injectable } from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.service';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private readonly storage: StorageService) {}

  async getVideoUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const ext = path.extname(fileName);
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    // TODO: auth 모듈 연동 후 userId를 JWT에서 추출
    const key = `logs/${userId}/${yyyy}/${mm}/${dd}/${randomUUID()}${ext}`;
    const uploadUrl = await this.storage.getPresignedUploadUrl(
      key,
      contentType,
    );
    return { uploadUrl, key };
  }
}
