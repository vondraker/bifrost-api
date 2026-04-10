import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../types/user.types';
import { JwtUserPayload } from './types/jwt-user-payload.type';

@Injectable()
export class AuthService {
    private readonly client: OAuth2Client;
    private readonly jwtSecret: string;
    private readonly googleClientId: string;

    constructor(private readonly configService: ConfigService) {
        this.googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
        this.jwtSecret = this.configService.get<string>('JWT_SECRET') || '';
        this.client = new OAuth2Client(this.googleClientId);

        if (!this.googleClientId || !this.jwtSecret) {
            throw new Error('Missing GOOGLE_CLIENT_ID or JWT_SECRET for auth module.');
        }
    }

    async loginWithGoogleCredential(credential: string): Promise<{ user: User; token: string }> {
        if (!credential) {
            throw new BadRequestException('Google credential is required');
        }

        const ticket = await this.client.verifyIdToken({
            idToken: credential,
            audience: this.googleClientId,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new UnauthorizedException('Invalid Google token');
        }

        const user: User = {
            id: payload.sub,
            email: payload.email,
            name: payload.name || 'User',
            picture: payload.picture,
        };

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
            },
            this.jwtSecret,
            { expiresIn: '1h' },
        );

        return { user, token };
    }

    getCurrentUser(token: string): User {
        if (!token) {
            throw new UnauthorizedException('Not authenticated');
        }

        let decoded: JwtUserPayload;
        try {
            decoded = jwt.verify(token, this.jwtSecret) as JwtUserPayload;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
        };
    }
}
