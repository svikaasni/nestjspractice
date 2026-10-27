import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TokenGeneratorService } from './token-generator.service';
import { RefreshTokenDto } from '../presentation/dto/refresh-token.dto';
import { AuthTokens } from '../domain/user.entity';
import { UnauthorizedDomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenGenerator: TokenGeneratorService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthTokens> {
    const tokenHash = this.tokenGenerator.hashToken(dto.refreshToken);

    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedDomainException('Invalid refresh token');
    }

    // Reuse detection: If a revoked token is presented, potential compromise!
    if (session.revokedAt) {
      // Invalidate all active sessions for this compromised user account
      await this.prisma.session.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedDomainException('Compromised session detected. All sessions revoked for security.');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedDomainException('Refresh token has expired');
    }

    const { rawToken, tokenHash: newHash, expiresAt } = this.tokenGenerator.generateRefreshToken();

    // Rotate: Revoke previous session, issue new active session
    const newSession = await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });

      return tx.session.create({
        data: {
          userId: session.userId,
          refreshTokenHash: newHash,
          expiresAt,
        },
      });
    });

    return this.tokenGenerator.createTokens(
      session.user.id,
      session.user.email,
      newSession.id,
      rawToken,
    );
  }
}
