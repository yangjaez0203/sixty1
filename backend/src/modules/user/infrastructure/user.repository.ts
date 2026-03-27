import { OAuthProvider, User } from '@prisma/client';

export interface CreateWithProviderParams {
  email: string;
  name: string;
  picture?: string;
  provider: OAuthProvider;
  providerId: string;
}

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByProviderAndProviderId(
    provider: OAuthProvider,
    providerId: string,
  ): Promise<User | null>;
  abstract createWithProvider(params: CreateWithProviderParams): Promise<User>;
}
