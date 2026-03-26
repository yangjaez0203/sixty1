import { Body, Controller, Post } from '@nestjs/common';
import { UploadService } from './upload.service';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @Body() dto: GetPresignedUrlDto,
  ): Promise<ApiResponse<{ uploadUrl: string; key: string }>> {
    const result = await this.uploadService.getVideoUploadUrl(
      dto.userId,
      dto.fileName,
      dto.contentType,
    );
    return ApiResponse.of(result);
  }
}
