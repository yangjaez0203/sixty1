import { Module } from '@nestjs/common';
import { SystemModule } from './modules/system/system.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    SystemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
