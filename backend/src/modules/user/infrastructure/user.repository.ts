import { User } from '@prisma/client';

export interface CreateWithProviderParams {
  email: string;
  name: string;
  picture?: string;
  provider: string;
  providerId: string;
}

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByProviderAndProviderId(
    provider: string,
    providerId: string,
  ): Promise<User | null>;
  abstract createWithProvider(params: CreateWithProviderParams): Promise<User>;
}
