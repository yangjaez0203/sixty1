export class AuthTokensResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserProfileResponseDto;
}

export class UserProfileResponseDto {
  id: string;
  email: string;
  name: string;
  picture: string | null;
}
