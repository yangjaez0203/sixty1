import { Injectable } from '@nestjs/common';
import { OAuthProvider, User } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateWithProviderParams, UserRepository } from './user.repository';

@Injectable()
export class UserPrismaRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByProviderAndProviderId(
    provider: OAuthProvider,
    providerId: string,
  ): Promise<User | null> {
    const account = await this.prisma.providerAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
    });
    if (!account) return null;
    return this.prisma.user.findUnique({ where: { id: account.userId } });
  }

  async createWithProvider(params: CreateWithProviderParams): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: params.email,
        name: params.name,
        picture: params.picture,
      },
    });
    await this.prisma.providerAccount.create({
      data: {
        provider: params.provider,
        providerId: params.providerId,
        userId: user.id,
      },
    });
    return user;
  }
}
