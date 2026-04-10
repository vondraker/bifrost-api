import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ message: string; user: unknown }> {
        const { user, token } = await this.authService.loginWithGoogleCredential(body.credential);

        response.cookie('token', token, {
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
    async getMe(@Req() request: Request): Promise<{ user: unknown }> {
        const user = this.authService.getCurrentUser(request.cookies?.token as string);
        return { user };
    }
}
