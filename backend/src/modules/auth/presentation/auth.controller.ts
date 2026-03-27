import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '../../../common/dto/api-response.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthService } from '../application/auth.service';
import { GoogleLoginRequestDto } from './dto/google-login.request.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token.request.dto';
import { AuthTokensResponseDto } from './dto/auth-tokens.response.dto';
import { UserProfileResponseDto } from './dto/auth-tokens.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(
    @Body() dto: GoogleLoginRequestDto,
  ): Promise<ApiResponse<AuthTokensResponseDto>> {
    const result = await this.authService.googleLogin(dto.idToken);
    return ApiResponse.of(result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenRequestDto,
  ): Promise<ApiResponse<AuthTokensResponseDto>> {
    const result = await this.authService.refresh(dto.refreshToken);
    return ApiResponse.of(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Body() dto: RefreshTokenRequestDto): Promise<ApiResponse<null>> {
    await this.authService.logout(dto.refreshToken);
    return ApiResponse.of(null);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<UserProfileResponseDto>> {
    const profile = await this.authService.getProfile(user.userId);
    return ApiResponse.of(profile);
  }
}
