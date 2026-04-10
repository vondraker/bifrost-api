import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
} from '@nestjs/common';
import { MinecraftService } from './minecraft.service';

@Controller('minecraft')
export class MinecraftController {
    constructor(private readonly minecraftService: MinecraftService) {}

    @Get('profile/:username')
    async getMinecraftProfile(@Param('username') username: string) {
        try {
            if (!username) {
                throw new BadRequestException({ message: 'Username is required' });
            }

            return await this.minecraftService.getProfile(username);
        } catch (error) {
            if (error instanceof Error && (error.name === 'BadRequestException' || error.name === 'NotFoundException')) {
                throw error;
            }

            if (error instanceof Error) {
                throw new InternalServerErrorException({
                    message: error.message || 'Failed to fetch Minecraft profile',
                });
            }

            throw new InternalServerErrorException({ message: 'Failed to fetch Minecraft profile' });
        }
    }
}
