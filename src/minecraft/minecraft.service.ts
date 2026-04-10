import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

type MojangProfile = {
    id: string;
    name: string;
};

@Injectable()
export class MinecraftService {
    async getProfile(username: string): Promise<{ username: string; uuid: string; skinUrl: string }> {
        const uuidResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

        if (!uuidResponse.ok) {
            if (uuidResponse.status === 404) {
                throw new NotFoundException({ message: "Minecraft username doesn't exist" });
            }
            throw new InternalServerErrorException({ message: 'Failed to fetch Minecraft profile' });
        }

        const uuidData = (await uuidResponse.json()) as MojangProfile;
        const skinUrl = `https://mc-heads.net/avatar/${uuidData.id}/128`;

        return {
            username: uuidData.name,
            uuid: uuidData.id,
            skinUrl,
        };
    }
}
