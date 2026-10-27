import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PasswordHasherService } from '../infrastructure/password-hasher.service';
import { TokenGeneratorService } from './token-generator.service';
import { RegisterDto } from '../presentation/dto/register.dto';
import { AuthResponse } from '../domain/user.entity';
import { ConflictDomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenGenerator: TokenGeneratorService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictDomainException('An account with this email address already exists');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const { rawToken, tokenHash, expiresAt } = this.tokenGenerator.generateRefreshToken();

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash,
        },
      });

      const session = await tx.session.create({
        data: {
          userId: user.id,
          refreshTokenHash: tokenHash,
          expiresAt,
        },
      });

      return { user, session };
    });

    const tokens = this.tokenGenerator.createTokens(
      result.user.id,
      result.user.email,
      result.session.id,
      rawToken,
    );

    return {
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
      tokens,
    };
  }
}
