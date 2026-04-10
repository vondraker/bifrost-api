import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<{ message: string; user: unknown }> {
        const { user, token } = await this.authService.loginWithGoogleCredential(body.credential);

        response.setCookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 3600000,
        });

        return {
            message: 'Login successful',
            user,
        };
    }

    @Get('me')
    async getMe(@Req() request: FastifyRequest): Promise<{ user: unknown }> {
        const cookies = (request as FastifyRequest & { cookies?: Record<string, string> }).cookies;
        const user = this.authService.getCurrentUser(cookies?.token as string);
        return { user };
    }
}
