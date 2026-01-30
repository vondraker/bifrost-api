import { Request, Response } from 'express';

export const getMinecraftProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        // Step 1: Get UUID from username using Mojang API
        const uuidResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

        if (!uuidResponse.ok) {
            if (uuidResponse.status === 404) {
                return res.status(404).json({ message: "Minecraft username doesn't exist" });
            }
            throw new Error('Failed to fetch Minecraft profile');
        }

        const uuidData = await uuidResponse.json();
        const uuid = uuidData.id;

        // Step 2: Generate skin URL using mc-heads.net (more reliable than Crafatar)
        // mc-heads.net accepts UUIDs with or without dashes
        const skinUrl = `https://mc-heads.net/avatar/${uuid}/128`;

        return res.json({
            username: uuidData.name,
            uuid: uuid,
            skinUrl: skinUrl
        });
    } catch (error: any) {
        console.error('Minecraft API error:', error);
        return res.status(500).json({
            message: error.message || 'Failed to fetch Minecraft profile'
        });
    }
};
