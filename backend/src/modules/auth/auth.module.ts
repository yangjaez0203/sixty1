import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthService } from './application/auth.service';
import { GoogleOAuthClient } from './infrastructure/google-oauth.client';
import { OAuthClient } from './infrastructure/oauth.client';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository';
import { RefreshTokenPrismaRepository } from './infrastructure/refresh-token-prisma.repository';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: OAuthClient,
      useClass: GoogleOAuthClient,
    },
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokenPrismaRepository,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
