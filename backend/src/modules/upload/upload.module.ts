import { Module } from '@nestjs/common';
import { UploadController } from './presentation/upload.controller';
import { UploadService } from './application/upload.service';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
