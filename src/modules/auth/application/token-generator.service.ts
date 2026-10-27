import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { AuthTokens } from '../domain/user.entity';

@Injectable()
export class TokenGeneratorService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(userId: string, email: string, sessionId: string): string {
    const payload = {
      sub: userId,
      email,
      sessionId,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      issuer: this.configService.get<string>('JWT_ISSUER', 'project-management-api'),
      audience: this.configService.get<string>('JWT_AUDIENCE', 'project-management-clients'),
    });
  }

  generateRefreshToken(): { rawToken: string; tokenHash: string; expiresAt: Date } {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    
    // Default 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { rawToken, tokenHash, expiresAt };
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  createTokens(userId: string, email: string, sessionId: string, rawRefreshToken: string): AuthTokens {
    return {
      accessToken: this.generateAccessToken(userId, email, sessionId),
      refreshToken: rawRefreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    };
  }
}
