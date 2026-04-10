import {
    BadRequestException,
    Controller,
    Get,
    HttpException,
    InternalServerErrorException,
    Param,
} from '@nestjs/common';
import { MinecraftService } from './minecraft.service';

@Controller('minecraft')
export class MinecraftController {
    constructor(private readonly minecraftService: MinecraftService) {}

    @Get('profile/:username')
    async getMinecraftProfile(@Param('username') username: string) {
        if (!username) {
            throw new BadRequestException({ message: 'Username is required' });
        }

        try {
            return await this.minecraftService.getProfile(username);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException({
                message: error instanceof Error ? error.message : 'Failed to fetch Minecraft profile',
            });
        }
    }
}
