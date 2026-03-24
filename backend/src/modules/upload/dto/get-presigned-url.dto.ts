import { IsString, IsIn } from 'class-validator';

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

export class GetPresignedUrlDto {
  @IsString()
  userId: string;

  @IsString()
  fileName: string;

  @IsIn(ALLOWED_VIDEO_TYPES, {
    message: `contentType must be one of: ${ALLOWED_VIDEO_TYPES.join(', ')}`,
  })
  contentType: string;
}
