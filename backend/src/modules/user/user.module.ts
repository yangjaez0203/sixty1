import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserRepository } from './infrastructure/user.repository';
import { UserPrismaRepository } from './infrastructure/user-prisma.repository';

@Module({
  providers: [
    UserService,
    { provide: UserRepository, useClass: UserPrismaRepository },
  ],
  exports: [UserService],
})
export class UserModule {}
