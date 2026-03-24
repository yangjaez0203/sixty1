import { Injectable } from '@nestjs/common';
import { StorageService } from '../../../common/storage/storage.service';
import { GetPresignedUrlResponseDto } from '../presentation/dto/get-presigned-url.dto';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private readonly storageService: StorageService) {}

  async getPresignedUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
  ): Promise<GetPresignedUrlResponseDto> {
    const ext = path.extname(fileName);
    const key = `logs/${userId}/${uuidv4()}${ext}`;

    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      key,
      contentType,
    );

    return { uploadUrl, key };
  }
}
