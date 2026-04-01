import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from './modules/system/system.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SystemModule,
    PrismaModule,
    AuthModule,
    UploadModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
