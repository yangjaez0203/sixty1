import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
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
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    const account = await this.prisma.providerAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true },
    });
    return account?.user ?? null;
  }

  async createWithProvider(params: CreateWithProviderParams): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: params.email,
        name: params.name,
        picture: params.picture,
        providerAccounts: {
          create: {
            provider: params.provider,
            providerId: params.providerId,
          },
        },
      },
    });
  }
}
