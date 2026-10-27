import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PasswordHasherService } from '../infrastructure/password-hasher.service';
import { TokenGeneratorService } from './token-generator.service';
import { LoginDto } from '../presentation/dto/login.dto';
import { AuthResponse } from '../domain/user.entity';
import { UnauthorizedDomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenGenerator: TokenGeneratorService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedDomainException('Invalid email or password');
    }

    const isPasswordValid = await this.passwordHasher.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedDomainException('Invalid email or password');
    }

    const { rawToken, tokenHash, expiresAt } = this.tokenGenerator.generateRefreshToken();

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: tokenHash,
        expiresAt,
      },
    });

    const tokens = this.tokenGenerator.createTokens(
      user.id,
      user.email,
      session.id,
      rawToken,
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tokens,
    };
  }
}
