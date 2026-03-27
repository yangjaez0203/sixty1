import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { OAuthClient, OAuthUserInfo } from './oauth.client';

@Injectable()
export class GoogleOAuthClient extends OAuthClient {
  private readonly client: OAuth2Client;

  constructor() {
    super();
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyIdToken(idToken: string): Promise<OAuthUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        throw new UnauthorizedException('Invalid Google ID token payload');
      }

      return {
        email: payload.email,
        name: payload.name ?? payload.email,
        picture: payload.picture,
        providerId: payload.sub,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Failed to verify Google ID token');
    }
  }
}
