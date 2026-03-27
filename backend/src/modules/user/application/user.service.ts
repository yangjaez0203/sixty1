import { Injectable } from '@nestjs/common';
import { OAuthProvider, User } from '@prisma/client';
import { UserRepository } from '../infrastructure/user.repository';

export interface FindOrCreateByProviderParams {
  email: string;
  name: string;
  picture?: string;
  provider: OAuthProvider;
  providerId: string;
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findOrCreateByProvider(
    params: FindOrCreateByProviderParams,
  ): Promise<User> {
    const existing = await this.userRepository.findByProviderAndProviderId(
      params.provider,
      params.providerId,
    );
    if (existing) return existing;

    return this.userRepository.createWithProvider(params);
  }
}
