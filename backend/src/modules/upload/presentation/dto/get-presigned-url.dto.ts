import { IsNotEmpty, IsString } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}

export class GetPresignedUrlResponseDto {
  uploadUrl: string;
  key: string;
}
