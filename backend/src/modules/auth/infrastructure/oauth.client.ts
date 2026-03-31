export interface OAuthUserInfo {
  email: string;
  name: string;
  picture?: string;
  providerId: string;
}

export abstract class OAuthClient {
  abstract verifyIdToken(idToken: string): Promise<OAuthUserInfo>;
}
