import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from './modules/system/system.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SystemModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
