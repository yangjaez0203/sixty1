import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UploadService } from '../application/upload.service';
import { GetPresignedUrlDto, GetPresignedUrlResponseDto } from './dto/get-presigned-url.dto';
import { ValidateVideoContentTypePipe } from './dto/validate-video-content-type.pipe';
import { ApiResponse } from '../../../common/dto/api-response.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  @HttpCode(HttpStatus.CREATED)
  async getPresignedUrl(
    @Body(ValidateVideoContentTypePipe) dto: GetPresignedUrlDto,
  ): Promise<ApiResponse<GetPresignedUrlResponseDto>> {
    const result = await this.uploadService.getPresignedUploadUrl(
      dto.userId,
      dto.fileName,
      dto.contentType,
    );
    return ApiResponse.of(result);
  }
}
